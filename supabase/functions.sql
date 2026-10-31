-- ============================================================================
-- AURELIA STUDENT MANAGEMENT SYSTEM — FUNCTIONS & TRIGGERS
-- ============================================================================

-- 1. Updated-At Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Role Extraction Helper (Security Definer with isolated search_path)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'Admin';
    END IF;

    SELECT role INTO v_role
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid()
    LIMIT 1;

    RETURN COALESCE(v_role, 'Staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Role verification utilities
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        (auth.jwt() ->> 'role') = 'service_role' OR
        public.get_current_user_role() = 'Admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        public.is_admin() OR
        public.get_current_user_role() = 'Teacher'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_accountant()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        public.is_admin() OR
        public.get_current_user_role() = 'Accountant'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.uid() IS NOT NULL AND
        public.get_current_user_role() IN ('Admin', 'Teacher', 'Accountant', 'Staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Automatic Profile Creation on Supabase Auth Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name VARCHAR(150);
    v_role VARCHAR(50);
BEGIN
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'Staff');
    IF v_role NOT IN ('Admin', 'Teacher', 'Accountant', 'Staff') THEN
        v_role := 'Staff';
    END IF;

    INSERT INTO public.profiles (
        id,
        auth_user_id,
        email,
        full_name,
        role,
        avatar_url
    ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        v_full_name,
        v_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (email) DO UPDATE
    SET auth_user_id = EXCLUDED.auth_user_id,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Student Fee Calculation Trigger Function (Triggered by Payments table)
CREATE OR REPLACE FUNCTION public.sync_student_fee_payment()
RETURNS TRIGGER AS $$
DECLARE
    target_fee_id UUID;
    total_paid NUMERIC(10,2);
    net_amount NUMERIC(10,2);
    rem_balance NUMERIC(10,2);
    new_status VARCHAR(20);
    all_payments JSONB;
BEGIN
    target_fee_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.student_fee_id ELSE NEW.student_fee_id END;

    -- Aggregate payments for this fee record
    SELECT COALESCE(SUM(amount), 0.00) INTO total_paid
    FROM public.payments
    WHERE student_fee_id = target_fee_id;

    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'student_fee_id', p.student_fee_id,
                'receipt_number', p.receipt_number,
                'amount', p.amount,
                'payment_date', p.payment_date,
                'payment_method', p.payment_method,
                'notes', p.notes,
                'recorded_by', p.recorded_by
            ) ORDER BY p.payment_date DESC
        ), '[]'::jsonb
    ) INTO all_payments
    FROM public.payments p
    WHERE p.student_fee_id = target_fee_id;

    SELECT net_payable INTO net_amount
    FROM public.student_fees
    WHERE id = target_fee_id;

    IF net_amount IS NOT NULL THEN
        rem_balance := GREATEST(0.00, net_amount - total_paid);
        new_status := CASE 
            WHEN rem_balance = 0.00 THEN 'Paid'
            WHEN total_paid > 0.00 THEN 'Partial'
            ELSE 'Pending'
        END;

        UPDATE public.student_fees
        SET paid_amount = total_paid,
            balance_amount = rem_balance,
            status = new_status,
            payments = all_payments,
            updated_at = NOW()
        WHERE id = target_fee_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Student Attendance Percentage Recalculation Trigger Function
CREATE OR REPLACE FUNCTION public.sync_student_attendance_rate()
RETURNS TRIGGER AS $$
DECLARE
    target_student_id UUID;
    total_sessions INT;
    present_sessions INT;
    calculated_rate NUMERIC(5,2);
BEGIN
    target_student_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.student_id ELSE NEW.student_id END;

    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status IN ('Present', 'Late'))
    INTO total_sessions, present_sessions
    FROM public.attendance_records
    WHERE student_id = target_student_id;

    IF total_sessions > 0 THEN
        calculated_rate := ROUND((present_sessions::NUMERIC / total_sessions::NUMERIC) * 100.0, 1);
    ELSE
        calculated_rate := 100.00;
    END IF;

    UPDATE public.students
    SET attendance_rate = calculated_rate,
        updated_at = NOW()
    WHERE id = target_student_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Student Guardian JSON Sync Function
CREATE OR REPLACE FUNCTION public.sync_student_guardian()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.guardian IS NOT NULL AND (NEW.guardian->>'name') IS NOT NULL AND trim(NEW.guardian->>'name') != '' THEN
        INSERT INTO public.guardians (
            student_id,
            name,
            relation,
            phone,
            email,
            occupation
        ) VALUES (
            NEW.id,
            NEW.guardian->>'name',
            COALESCE(NEW.guardian->>'relation', 'Guardian'),
            COALESCE(NEW.guardian->>'phone', 'N/A'),
            NEW.guardian->>'email',
            NEW.guardian->>'occupation'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

