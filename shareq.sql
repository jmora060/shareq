--
-- PostgreSQL database dump
--

-- Dumped from database version 11.6
-- Dumped by pg_dump version 12.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

--
-- Name: queues; Type: TABLE; Schema: public; Owner: jakemorales
--

CREATE TABLE public.queues (
    room integer NOT NULL,
    access_token character varying(256),
    refresh_token character varying(256),
    created_by character varying(256) NOT NULL,
    current_queued text,
    auto_queue boolean DEFAULT true,
    token_expires_at bigint
);


ALTER TABLE public.queues OWNER TO jakemorales;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: jakemorales
--

CREATE TABLE public.sessions (
    sid character varying(255) NOT NULL,
    sess json NOT NULL,
    expired timestamp with time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO jakemorales;

--
-- Name: songs; Type: TABLE; Schema: public; Owner: jakemorales
--

CREATE TABLE public.songs (
    id integer NOT NULL,
    votes integer DEFAULT 0,
    queue integer,
    data json,
    played boolean DEFAULT false,
    uri text
);


ALTER TABLE public.songs OWNER TO jakemorales;

--
-- Name: songs_id_seq; Type: SEQUENCE; Schema: public; Owner: jakemorales
--

CREATE SEQUENCE public.songs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.songs_id_seq OWNER TO jakemorales;

--
-- Name: songs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jakemorales
--

ALTER SEQUENCE public.songs_id_seq OWNED BY public.songs.id;


--
-- Name: songs id; Type: DEFAULT; Schema: public; Owner: jakemorales
--

ALTER TABLE ONLY public.songs ALTER COLUMN id SET DEFAULT nextval('public.songs_id_seq'::regclass);


--
-- Data for Name: queues; Type: TABLE DATA; Schema: public; Owner: jakemorales
--


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: jakemorales
--

COPY public.sessions (sid, sess, expired) FROM stdin;
\.


--
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: jakemorales
--


--
-- Name: songs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jakemorales
--

SELECT pg_catalog.setval('public.songs_id_seq', 24, true);


--
-- Name: queues queues_pkey; Type: CONSTRAINT; Schema: public; Owner: jakemorales
--

ALTER TABLE ONLY public.queues
    ADD CONSTRAINT queues_pkey PRIMARY KEY (room);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: jakemorales
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: jakemorales
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (id);


--
-- Name: sessions_expired_index; Type: INDEX; Schema: public; Owner: jakemorales
--

CREATE INDEX sessions_expired_index ON public.sessions USING btree (expired);


--
-- Name: songs songs_queue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jakemorales
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_queue_fkey FOREIGN KEY (queue) REFERENCES public.queues(room);


--
-- PostgreSQL database dump complete
--

