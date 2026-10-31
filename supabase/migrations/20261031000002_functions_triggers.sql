-- ============================================================================
-- AURELIA STUDENT MANAGEMENT SYSTEM — MIGRATION 02: FUNCTIONS & TRIGGERS
-- Description: Automated timestamp triggers, balance sync, attendance sync,
--              user profile lifecycle trigger, and role verification functions.
-- ============================================================================

-- 1. Generic Updated-At Timestamp Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach Updated-At Triggers to tables
DO $$
BEGIN
    CREATE TRIGGER trg_institution_settings_updated_at
        BEFORE UPDATE ON public.institution_settings
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_departments_updated_at
        BEFORE UPDATE ON public.departments
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_faculty_updated_at
        BEFORE UPDATE ON public.faculty
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_courses_updated_at
        BEFORE UPDATE ON public.courses
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_subjects_updated_at
        BEFORE UPDATE ON public.subjects
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_students_updated_at
        BEFORE UPDATE ON public.students
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_guardians_updated_at
        BEFORE UPDATE ON public.guardians
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_attendance_records_updated_at
        BEFORE UPDATE ON public.attendance_records
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_examinations_updated_at
        BEFORE UPDATE ON public.examinations
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_examination_results_updated_at
        BEFORE UPDATE ON public.examination_results
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_fee_structures_updated_at
        BEFORE UPDATE ON public.fee_structures
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_student_fees_updated_at
        BEFORE UPDATE ON public.student_fees
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_academic_events_updated_at
        BEFORE UPDATE ON public.academic_events
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 2. Secure Current User Role Helper (SECURITY DEFINER with fixed search_path)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'Anonymous';
    END IF;

    SELECT role INTO v_role
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid()
    LIMIT 1;

    RETURN COALESCE(v_role, 'Staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper role checkers
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
    
    -- Only allow specified roles; default to 'Staff'
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

-- Attach trigger to auth.users if permissions allow (standard Supabase pattern)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping auth.users trigger setup due to privilege restrictions. Profiles can be registered via API.';
END $$;


-- 4. Synchronize Student Fees when a Payment is recorded, updated, or removed
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

    -- Compute total payments for this student fee record
    SELECT COALESCE(SUM(amount), 0.00) INTO total_paid
    FROM public.payments
    WHERE student_fee_id = target_fee_id;

    -- Aggregate payments into JSON array for instant frontend consumption
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

    -- Retrieve net payable for this fee
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

DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_payment_sync_fee ON public.payments;
    CREATE TRIGGER trg_payment_sync_fee
        AFTER INSERT OR UPDATE OR DELETE ON public.payments
        FOR EACH ROW EXECUTE FUNCTION public.sync_student_fee_payment();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 5. Synchronize Student Attendance Rate on attendance modifications
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

DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_attendance_sync_student ON public.attendance_records;
    CREATE TRIGGER trg_attendance_sync_student
        AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
        FOR EACH ROW EXECUTE FUNCTION public.sync_student_attendance_rate();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 6. Synchronize Student Guardian Normalized Record
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

DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_student_sync_guardian ON public.students;
    CREATE TRIGGER trg_student_sync_guardian
        AFTER INSERT OR UPDATE OF guardian ON public.students
        FOR EACH ROW EXECUTE FUNCTION public.sync_student_guardian();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
