--
-- PostgreSQL database dump
-- Lymo Studio Foto - Aplikasi Keuangan
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET row_security = on;

--
-- Name: Custom ID Generator Function (DDMMYY + 4 digit sequential)
-- Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.generate_sequential_id(table_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    date_prefix text;
    max_id text;
    next_seq integer;
    new_id text;
BEGIN
    -- Generate date prefix: DDMMYY
    date_prefix := to_char(CURRENT_DATE, 'DDMMYY');
    
    -- Get max ID for today from the specified table
    -- Format: DDMMYY + 4 digits (e.g., 2501240001)
    EXECUTE format('
        SELECT COALESCE(MAX(id), %L)
        FROM %I
        WHERE id LIKE %L || ''%''
    ', date_prefix || '0000', table_name, date_prefix) INTO max_id;
    
    -- Extract sequence number (last 4 digits)
    -- Format: DDMMYY (6 chars) + 4 digits = 10 chars total
    IF max_id IS NULL OR max_id = date_prefix || '0000' OR LENGTH(max_id) < 10 THEN
        next_seq := 1;
    ELSE
        -- Extract last 4 characters (sequence number)
        next_seq := (RIGHT(max_id, 4))::integer + 1;
    END IF;
    
    -- Generate new ID: DDMMYY + 4 digit sequential
    new_id := date_prefix || lpad(next_seq::text, 4, '0');
    
    RETURN new_id;
END;
$$;

--
-- Name: Trigger Function untuk Auto Generate ID
-- Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.trigger_generate_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Generate ID hanya jika id belum diisi
    IF NEW.id IS NULL OR NEW.id = '' OR NEW.id = 'NULL' THEN
        NEW.id := public.generate_sequential_id(TG_TABLE_NAME);
    END IF;
    RETURN NEW;
END;
$$;

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'owner'::text])))
);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

--
-- Name: master_produk; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_produk (
    id text NOT NULL,
    id_produk text NOT NULL,
    nama_produk text NOT NULL,
    kategori text NOT NULL,
    harga_jual numeric(15,2) NOT NULL,
    satuan text NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT master_produk_kategori_check CHECK ((kategori = ANY (ARRAY['Paket'::text, 'Tambahan'::text]))),
    CONSTRAINT master_produk_satuan_check CHECK ((satuan = ANY (ARRAY['Paket'::text, 'Orang'::text, 'File'::text, 'Cetak'::text])))
);

ALTER TABLE ONLY public.master_produk
    ADD CONSTRAINT master_produk_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.master_produk
    ADD CONSTRAINT master_produk_id_produk_key UNIQUE (id_produk);

--
-- Name: database_klien; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.database_klien (
    id text NOT NULL,
    id_klien text NOT NULL,
    nama_klien text NOT NULL,
    email text,
    telepon text,
    alamat text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.database_klien
    ADD CONSTRAINT database_klien_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.database_klien
    ADD CONSTRAINT database_klien_id_klien_key UNIQUE (id_klien);

--
-- Name: transaksi_penjualan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaksi_penjualan (
    id text NOT NULL,
    tanggal date NOT NULL,
    no_invoice text NOT NULL,
    id_klien text NOT NULL,
    id_produk text NOT NULL,
    nama_produk text NOT NULL,
    jenis_item text NOT NULL,
    qty integer DEFAULT 1 NOT NULL,
    harga_satuan numeric(15,2) NOT NULL,
    diskon numeric(15,2) DEFAULT 0 NOT NULL,
    total_tagihan numeric(15,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transaksi_penjualan_jenis_item_check CHECK ((jenis_item = ANY (ARRAY['Paket'::text, 'Tambahan'::text])))
);

ALTER TABLE ONLY public.transaksi_penjualan
    ADD CONSTRAINT transaksi_penjualan_pkey PRIMARY KEY (id);

--
-- Name: master_tugas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_tugas (
    id text NOT NULL,
    id_tugas text NOT NULL,
    nama_tugas text NOT NULL,
    bonus_per_unit numeric(15,2) NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.master_tugas
    ADD CONSTRAINT master_tugas_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.master_tugas
    ADD CONSTRAINT master_tugas_id_tugas_key UNIQUE (id_tugas);

--
-- Name: master_karyawan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_karyawan (
    id text NOT NULL,
    id_karyawan text NOT NULL,
    nama_karyawan text NOT NULL,
    gaji_pokok numeric(15,2) NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.master_karyawan
    ADD CONSTRAINT master_karyawan_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.master_karyawan
    ADD CONSTRAINT master_karyawan_id_karyawan_key UNIQUE (id_karyawan);

--
-- Name: log_tugas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.log_tugas (
    id text NOT NULL,
    tanggal date NOT NULL,
    periode text NOT NULL,
    id_karyawan text NOT NULL,
    id_tugas text NOT NULL,
    jumlah_tugas integer DEFAULT 1 NOT NULL,
    bonus_terhitung numeric(15,2) NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT log_tugas_status_check CHECK ((status = ANY (ARRAY['Pending'::text, 'Approved'::text])))
);

ALTER TABLE ONLY public.log_tugas
    ADD CONSTRAINT log_tugas_pkey PRIMARY KEY (id);

--
-- Name: penggajian; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.penggajian (
    id text NOT NULL,
    periode text NOT NULL,
    id_karyawan text NOT NULL,
    gaji_pokok numeric(15,2) NOT NULL,
    total_bonus numeric(15,2) DEFAULT 0 NOT NULL,
    total_gaji numeric(15,2) NOT NULL,
    status text DEFAULT 'Draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT penggajian_status_check CHECK ((status = ANY (ARRAY['Draft'::text, 'Final'::text])))
);

ALTER TABLE ONLY public.penggajian
    ADD CONSTRAINT penggajian_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.penggajian
    ADD CONSTRAINT penggajian_periode_id_karyawan_key UNIQUE (periode, id_karyawan);

--
-- Name: biaya_operasional; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biaya_operasional (
    id text NOT NULL,
    tanggal date NOT NULL,
    deskripsi text NOT NULL,
    jumlah numeric(15,2) NOT NULL,
    ref_invoice text,
    kategori text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.biaya_operasional
    ADD CONSTRAINT biaya_operasional_pkey PRIMARY KEY (id);

--
-- Name: fix_cost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fix_cost (
    id text NOT NULL,
    nama_biaya text NOT NULL,
    jumlah numeric(15,2) NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.fix_cost
    ADD CONSTRAINT fix_cost_pkey PRIMARY KEY (id);

--
-- Name: idx_transaksi_tanggal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaksi_tanggal ON public.transaksi_penjualan USING btree (tanggal);

--
-- Name: idx_transaksi_invoice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaksi_invoice ON public.transaksi_penjualan USING btree (no_invoice);

--
-- Name: idx_log_tugas_periode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_log_tugas_periode ON public.log_tugas USING btree (periode);

--
-- Name: idx_log_tugas_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_log_tugas_status ON public.log_tugas USING btree (status);

--
-- Name: idx_penggajian_periode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_penggajian_periode ON public.penggajian USING btree (periode);

--
-- Name: idx_biaya_tanggal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_biaya_tanggal ON public.biaya_operasional USING btree (tanggal);

--
-- Name: Triggers untuk Auto Generate ID
-- Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_master_produk_id
    BEFORE INSERT ON public.master_produk
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

CREATE TRIGGER trigger_database_klien_id
    BEFORE INSERT ON public.database_klien
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

CREATE TRIGGER trigger_transaksi_penjualan_id
    BEFORE INSERT ON public.transaksi_penjualan
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

CREATE TRIGGER trigger_master_tugas_id
    BEFORE INSERT ON public.master_tugas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

CREATE TRIGGER trigger_master_karyawan_id
    BEFORE INSERT ON public.master_karyawan
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

CREATE TRIGGER trigger_log_tugas_id
    BEFORE INSERT ON public.log_tugas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

CREATE TRIGGER trigger_penggajian_id
    BEFORE INSERT ON public.penggajian
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

CREATE TRIGGER trigger_biaya_operasional_id
    BEFORE INSERT ON public.biaya_operasional
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

CREATE TRIGGER trigger_fix_cost_id
    BEFORE INSERT ON public.fix_cost
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_id();

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: master_produk; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_produk ENABLE ROW LEVEL SECURITY;

--
-- Name: database_klien; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.database_klien ENABLE ROW LEVEL SECURITY;

--
-- Name: transaksi_penjualan; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transaksi_penjualan ENABLE ROW LEVEL SECURITY;

--
-- Name: master_tugas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_tugas ENABLE ROW LEVEL SECURITY;

--
-- Name: master_karyawan; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_karyawan ENABLE ROW LEVEL SECURITY;

--
-- Name: log_tugas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.log_tugas ENABLE ROW LEVEL SECURITY;

--
-- Name: penggajian; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.penggajian ENABLE ROW LEVEL SECURITY;

--
-- Name: biaya_operasional; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.biaya_operasional ENABLE ROW LEVEL SECURITY;

--
-- Name: fix_cost; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fix_cost ENABLE ROW LEVEL SECURITY;

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.users
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.master_produk
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.database_klien
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.transaksi_penjualan
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.master_tugas
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.master_karyawan
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.log_tugas
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.penggajian
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.biaya_operasional
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- Name: Allow all for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users" ON public.fix_cost
    FOR ALL
    USING ((auth.role() = 'authenticated'::text));

--
-- PostgreSQL database dump complete
--
