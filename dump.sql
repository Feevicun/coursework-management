--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: update_chat_timestamp(); Type: FUNCTION; Schema: public; Owner: vikaosoba
--

CREATE FUNCTION public.update_chat_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_chat_timestamp() OWNER TO vikaosoba;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: vikaosoba
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO vikaosoba;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: available_places; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.available_places (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    type character varying(20) NOT NULL,
    available_spots integer NOT NULL,
    course integer NOT NULL,
    specialty_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    max_students integer DEFAULT 5,
    requirements text,
    description text,
    current_students integer DEFAULT 0,
    CONSTRAINT available_places_available_spots_check CHECK ((available_spots > 0)),
    CONSTRAINT available_places_course_check CHECK (((course >= 1) AND (course <= 6))),
    CONSTRAINT available_places_type_check CHECK (((type)::text = ANY ((ARRAY['coursework'::character varying, 'diploma'::character varying, 'practice'::character varying])::text[])))
);


ALTER TABLE public.available_places OWNER TO vikaosoba;

--
-- Name: available_places_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.available_places_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.available_places_id_seq OWNER TO vikaosoba;

--
-- Name: available_places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.available_places_id_seq OWNED BY public.available_places.id;


--
-- Name: chat_members; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.chat_members (
    id integer NOT NULL,
    chat_id integer,
    user_id integer,
    joined_at timestamp without time zone DEFAULT now(),
    is_muted boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    unread_count integer DEFAULT 0
);


ALTER TABLE public.chat_members OWNER TO vikaosoba;

--
-- Name: chat_members_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.chat_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_members_id_seq OWNER TO vikaosoba;

--
-- Name: chat_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.chat_members_id_seq OWNED BY public.chat_members.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    chat_id integer,
    sender_id integer,
    content text,
    message_type character varying(20) DEFAULT 'text'::character varying,
    reply_to integer,
    attachment_data jsonb,
    is_pinned boolean DEFAULT false,
    is_edited boolean DEFAULT false,
    reactions jsonb DEFAULT '{}'::jsonb,
    status character varying(20) DEFAULT 'sent'::character varying,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT chat_messages_message_type_check CHECK (((message_type)::text = ANY ((ARRAY['text'::character varying, 'voice'::character varying, 'file'::character varying, 'image'::character varying, 'video'::character varying, 'location'::character varying, 'system'::character varying])::text[]))),
    CONSTRAINT chat_messages_status_check CHECK (((status)::text = ANY ((ARRAY['sent'::character varying, 'delivered'::character varying, 'read'::character varying])::text[])))
);


ALTER TABLE public.chat_messages OWNER TO vikaosoba;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_messages_id_seq OWNER TO vikaosoba;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: chat_participants; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.chat_participants (
    id integer NOT NULL,
    chat_id integer,
    user_id integer,
    joined_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_participants OWNER TO vikaosoba;

--
-- Name: chat_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.chat_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_participants_id_seq OWNER TO vikaosoba;

--
-- Name: chat_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.chat_participants_id_seq OWNED BY public.chat_participants.id;


--
-- Name: chats; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    name character varying(255),
    type character varying(20) NOT NULL,
    avatar_url character varying(500),
    description text,
    last_message text,
    last_message_at timestamp without time zone,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT chats_type_check CHECK (((type)::text = ANY ((ARRAY['private'::character varying, 'group'::character varying])::text[])))
);


ALTER TABLE public.chats OWNER TO vikaosoba;

--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chats_id_seq OWNER TO vikaosoba;

--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.conversation_participants (
    conversation_id uuid NOT NULL,
    user_id integer NOT NULL,
    last_seen timestamp without time zone
);


ALTER TABLE public.conversation_participants OWNER TO vikaosoba;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    title character varying(255)
);


ALTER TABLE public.conversations OWNER TO vikaosoba;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    faculty_id integer,
    name character varying(255) NOT NULL
);


ALTER TABLE public.departments OWNER TO vikaosoba;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_id_seq OWNER TO vikaosoba;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.events (
    id integer NOT NULL,
    "userEmail" character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    date timestamp with time zone NOT NULL,
    type character varying(50) NOT NULL,
    "time" character varying(5),
    location text,
    link text,
    description text,
    completed boolean DEFAULT false
);


ALTER TABLE public.events OWNER TO vikaosoba;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO vikaosoba;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: faculties; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.faculties (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.faculties OWNER TO vikaosoba;

--
-- Name: faculties_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.faculties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.faculties_id_seq OWNER TO vikaosoba;

--
-- Name: faculties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.faculties_id_seq OWNED BY public.faculties.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    course integer NOT NULL,
    specialty_id integer,
    education_level character varying(10),
    CONSTRAINT groups_education_level_check CHECK (((education_level)::text = ANY ((ARRAY['бакалавр'::character varying, 'магістр'::character varying])::text[])))
);


ALTER TABLE public.groups OWNER TO vikaosoba;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups_id_seq OWNER TO vikaosoba;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: message_read_receipts; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.message_read_receipts (
    id integer NOT NULL,
    message_id integer,
    user_id integer,
    read_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.message_read_receipts OWNER TO vikaosoba;

--
-- Name: message_read_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.message_read_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.message_read_receipts_id_seq OWNER TO vikaosoba;

--
-- Name: message_read_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.message_read_receipts_id_seq OWNED BY public.message_read_receipts.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    student_email character varying(255) NOT NULL,
    receiver_email character varying(255) NOT NULL,
    attachment character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.messages OWNER TO vikaosoba;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO vikaosoba;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(500) NOT NULL,
    content text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    category character varying(50) DEFAULT 'personal'::character varying,
    is_bookmarked boolean DEFAULT false,
    is_public boolean DEFAULT false,
    background_color character varying(7) DEFAULT '#ffffff'::character varying,
    text_color character varying(7) DEFAULT '#000000'::character varying,
    images text[] DEFAULT '{}'::text[],
    word_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    display_order integer DEFAULT 0
);


ALTER TABLE public.notes OWNER TO vikaosoba;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notes_id_seq OWNER TO vikaosoba;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    related_entity character varying(50),
    related_entity_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO vikaosoba;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO vikaosoba;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    link character varying(500) NOT NULL,
    category character varying(100) DEFAULT 'other'::character varying NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    click_count integer DEFAULT 0
);


ALTER TABLE public.resources OWNER TO vikaosoba;

--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resources_id_seq OWNER TO vikaosoba;

--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: specialties; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.specialties (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name text NOT NULL,
    faculty_id integer
);


ALTER TABLE public.specialties OWNER TO vikaosoba;

--
-- Name: specialties_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.specialties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.specialties_id_seq OWNER TO vikaosoba;

--
-- Name: specialties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.specialties_id_seq OWNED BY public.specialties.id;


--
-- Name: student_achievements; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    date date NOT NULL,
    type character varying(100),
    organization character varying(255),
    certificate_url text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_achievements OWNER TO vikaosoba;

--
-- Name: student_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_achievements_id_seq OWNER TO vikaosoba;

--
-- Name: student_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_achievements_id_seq OWNED BY public.student_achievements.id;


--
-- Name: student_activity_sessions; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_activity_sessions (
    id integer NOT NULL,
    user_id integer,
    start_time timestamp with time zone DEFAULT now(),
    end_time timestamp with time zone,
    duration integer,
    activity_type character varying(50) DEFAULT 'writing'::character varying,
    chapters_worked text[],
    focus_score integer,
    time_of_day character varying(20),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.student_activity_sessions OWNER TO vikaosoba;

--
-- Name: student_activity_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_activity_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_activity_sessions_id_seq OWNER TO vikaosoba;

--
-- Name: student_activity_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_activity_sessions_id_seq OWNED BY public.student_activity_sessions.id;


--
-- Name: student_applications; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_applications (
    id integer NOT NULL,
    topic character varying(500) NOT NULL,
    description text NOT NULL,
    goals text NOT NULL,
    requirements text NOT NULL,
    teacher_id integer,
    deadline date NOT NULL,
    student_id integer,
    student_name character varying(200) NOT NULL,
    student_email character varying(200) NOT NULL,
    student_phone character varying(20),
    student_program character varying(200),
    student_year character varying(50),
    status character varying(20) DEFAULT 'pending'::character varying,
    application_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp with time zone,
    processed_by integer,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    student_group character varying(100),
    work_type character varying(20) DEFAULT 'coursework'::character varying,
    type character varying(20) DEFAULT 'course'::character varying,
    student_specialty_id integer,
    student_specialty_code character varying(50),
    student_faculty_id integer,
    student_id_number character varying(50),
    CONSTRAINT student_applications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.student_applications OWNER TO vikaosoba;

--
-- Name: student_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_applications_id_seq OWNER TO vikaosoba;

--
-- Name: student_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_applications_id_seq OWNED BY public.student_applications.id;


--
-- Name: student_assignments; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_assignments (
    id integer NOT NULL,
    student_id integer,
    place_id integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_assignments OWNER TO vikaosoba;

--
-- Name: student_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_assignments_id_seq OWNER TO vikaosoba;

--
-- Name: student_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_assignments_id_seq OWNED BY public.student_assignments.id;


--
-- Name: student_deadlines; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_deadlines (
    id integer NOT NULL,
    user_id integer,
    milestone character varying(255) NOT NULL,
    deadline_date date NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.student_deadlines OWNER TO vikaosoba;

--
-- Name: student_deadlines_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_deadlines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_deadlines_id_seq OWNER TO vikaosoba;

--
-- Name: student_deadlines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_deadlines_id_seq OWNED BY public.student_deadlines.id;


--
-- Name: student_goals; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_goals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    goal character varying(500) NOT NULL,
    description text,
    deadline date NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    progress integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_goals OWNER TO vikaosoba;

--
-- Name: student_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_goals_id_seq OWNER TO vikaosoba;

--
-- Name: student_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_goals_id_seq OWNED BY public.student_goals.id;


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    group_name character varying(50),
    course character varying(50),
    bio text,
    avatar_url text,
    phone character varying(50),
    linkedin_url character varying(255),
    github_url character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    student_group character varying(50)
);


ALTER TABLE public.student_profiles OWNER TO vikaosoba;

--
-- Name: student_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_profiles_id_seq OWNER TO vikaosoba;

--
-- Name: student_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_profiles_id_seq OWNED BY public.student_profiles.id;


--
-- Name: student_projects; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_projects (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(500) NOT NULL,
    type character varying(100) NOT NULL,
    status character varying(50) NOT NULL,
    description text,
    technologies text,
    project_url text,
    github_url text,
    start_date date,
    end_date date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_projects OWNER TO vikaosoba;

--
-- Name: student_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_projects_id_seq OWNER TO vikaosoba;

--
-- Name: student_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_projects_id_seq OWNED BY public.student_projects.id;


--
-- Name: student_topics; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.student_topics (
    id integer NOT NULL,
    student_id integer NOT NULL,
    project_type character varying(20) NOT NULL,
    topic text NOT NULL,
    description text,
    goals text,
    requirements text,
    teacher_id integer,
    teacher_name character varying(255),
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    approved_at timestamp without time zone
);


ALTER TABLE public.student_topics OWNER TO vikaosoba;

--
-- Name: student_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.student_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_topics_id_seq OWNER TO vikaosoba;

--
-- Name: student_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.student_topics_id_seq OWNED BY public.student_topics.id;


--
-- Name: teacher_comments; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.teacher_comments (
    id integer NOT NULL,
    chapter_id integer,
    teacher_id integer,
    text text NOT NULL,
    status character varying(20) NOT NULL,
    type character varying(20) DEFAULT 'feedback'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT teacher_comments_status_check CHECK (((status)::text = ANY ((ARRAY['info'::character varying, 'warning'::character varying, 'error'::character varying, 'success'::character varying])::text[]))),
    CONSTRAINT teacher_comments_type_check CHECK (((type)::text = ANY ((ARRAY['feedback'::character varying, 'response'::character varying])::text[])))
);


ALTER TABLE public.teacher_comments OWNER TO vikaosoba;

--
-- Name: teacher_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.teacher_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teacher_comments_id_seq OWNER TO vikaosoba;

--
-- Name: teacher_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.teacher_comments_id_seq OWNED BY public.teacher_comments.id;


--
-- Name: teacher_future_topics; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.teacher_future_topics (
    id integer NOT NULL,
    user_id integer NOT NULL,
    topic character varying(500) NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teacher_future_topics OWNER TO vikaosoba;

--
-- Name: teacher_future_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.teacher_future_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teacher_future_topics_id_seq OWNER TO vikaosoba;

--
-- Name: teacher_future_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.teacher_future_topics_id_seq OWNED BY public.teacher_future_topics.id;


--
-- Name: teacher_profiles; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.teacher_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255),
    bio text,
    avatar_url text,
    office_hours text,
    phone character varying(50),
    website character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teacher_profiles OWNER TO vikaosoba;

--
-- Name: teacher_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.teacher_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teacher_profiles_id_seq OWNER TO vikaosoba;

--
-- Name: teacher_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.teacher_profiles_id_seq OWNED BY public.teacher_profiles.id;


--
-- Name: teacher_research_directions; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.teacher_research_directions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    area character varying(500) NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teacher_research_directions OWNER TO vikaosoba;

--
-- Name: teacher_research_directions_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.teacher_research_directions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teacher_research_directions_id_seq OWNER TO vikaosoba;

--
-- Name: teacher_research_directions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.teacher_research_directions_id_seq OWNED BY public.teacher_research_directions.id;


--
-- Name: teacher_students; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.teacher_students (
    id integer NOT NULL,
    teacher_id integer,
    student_id integer,
    created_at timestamp without time zone DEFAULT now(),
    student_name character varying(255),
    student_email character varying(255),
    student_phone character varying(50),
    student_avatar text,
    course integer,
    faculty character varying(255),
    specialty character varying(255),
    work_type character varying(50),
    work_title character varying(500),
    start_date date,
    deadline date,
    progress integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    application_id integer,
    grade integer DEFAULT 0,
    unread_comments integer DEFAULT 0,
    last_activity timestamp without time zone DEFAULT now(),
    student_bio text,
    confirmed_at timestamp without time zone DEFAULT now(),
    supervisor character varying(255),
    program character varying(255),
    year character varying(50)
);


ALTER TABLE public.teacher_students OWNER TO vikaosoba;

--
-- Name: teacher_students_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.teacher_students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teacher_students_id_seq OWNER TO vikaosoba;

--
-- Name: teacher_students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.teacher_students_id_seq OWNED BY public.teacher_students.id;


--
-- Name: teacher_works; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.teacher_works (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(500) NOT NULL,
    type character varying(100) NOT NULL,
    year character varying(10) NOT NULL,
    description text,
    file_url text,
    publication_url text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teacher_works OWNER TO vikaosoba;

--
-- Name: teacher_works_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.teacher_works_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teacher_works_id_seq OWNER TO vikaosoba;

--
-- Name: teacher_works_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.teacher_works_id_seq OWNED BY public.teacher_works.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.teachers (
    full_name text NOT NULL,
    department_id integer,
    skills jsonb,
    id integer NOT NULL
);


ALTER TABLE public.teachers OWNER TO vikaosoba;

--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.teachers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teachers_id_seq OWNER TO vikaosoba;

--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: user_chapters; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.user_chapters (
    id integer NOT NULL,
    user_id integer,
    project_type character varying(50) NOT NULL,
    chapter_key character varying(50) NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    student_note text DEFAULT ''::text,
    uploaded_file_name character varying(255),
    uploaded_file_date timestamp without time zone,
    uploaded_file_size character varying(50),
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    title character varying(500),
    submitted_for_review_at timestamp without time zone,
    graded_by character varying(255),
    graded_at timestamp without time zone,
    project_title character varying(500),
    supervisor character varying(255),
    project_start_date date,
    project_deadline date,
    application_id integer,
    work_type character varying(20) DEFAULT 'coursework'::character varying
);


ALTER TABLE public.user_chapters OWNER TO vikaosoba;

--
-- Name: user_chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.user_chapters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_chapters_id_seq OWNER TO vikaosoba;

--
-- Name: user_chapters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.user_chapters_id_seq OWNED BY public.user_chapters.id;


--
-- Name: user_projects; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.user_projects (
    id integer NOT NULL,
    user_id integer NOT NULL,
    active_project_type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT user_projects_active_project_type_check CHECK (((active_project_type)::text = ANY ((ARRAY['diploma'::character varying, 'coursework'::character varying, 'practice'::character varying])::text[])))
);


ALTER TABLE public.user_projects OWNER TO vikaosoba;

--
-- Name: user_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.user_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_projects_id_seq OWNER TO vikaosoba;

--
-- Name: user_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.user_projects_id_seq OWNED BY public.user_projects.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    registeredat timestamp without time zone DEFAULT now() NOT NULL,
    lastloginat timestamp without time zone,
    lastlogoutat timestamp without time zone,
    faculty_id integer,
    department_id integer,
    avatar_url text,
    active_project_type character varying(50),
    is_online boolean DEFAULT false,
    last_seen timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now(),
    avatar text,
    specialty_id integer,
    group_id integer,
    phone character varying(20)
);


ALTER TABLE public.users OWNER TO vikaosoba;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO vikaosoba;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: writing_statistics; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.writing_statistics (
    id integer NOT NULL,
    user_id integer,
    chapter_key character varying(100),
    word_count integer DEFAULT 0,
    characters_count integer DEFAULT 0,
    images_count integer DEFAULT 0,
    time_spent integer DEFAULT 0,
    session_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.writing_statistics OWNER TO vikaosoba;

--
-- Name: writing_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.writing_statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.writing_statistics_id_seq OWNER TO vikaosoba;

--
-- Name: writing_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.writing_statistics_id_seq OWNED BY public.writing_statistics.id;


--
-- Name: available_places id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.available_places ALTER COLUMN id SET DEFAULT nextval('public.available_places_id_seq'::regclass);


--
-- Name: chat_members id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_members ALTER COLUMN id SET DEFAULT nextval('public.chat_members_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: chat_participants id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants ALTER COLUMN id SET DEFAULT nextval('public.chat_participants_id_seq'::regclass);


--
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: faculties id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.faculties ALTER COLUMN id SET DEFAULT nextval('public.faculties_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: message_read_receipts id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.message_read_receipts ALTER COLUMN id SET DEFAULT nextval('public.message_read_receipts_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: specialties id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.specialties ALTER COLUMN id SET DEFAULT nextval('public.specialties_id_seq'::regclass);


--
-- Name: student_achievements id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_achievements ALTER COLUMN id SET DEFAULT nextval('public.student_achievements_id_seq'::regclass);


--
-- Name: student_activity_sessions id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_activity_sessions ALTER COLUMN id SET DEFAULT nextval('public.student_activity_sessions_id_seq'::regclass);


--
-- Name: student_applications id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_applications ALTER COLUMN id SET DEFAULT nextval('public.student_applications_id_seq'::regclass);


--
-- Name: student_assignments id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_assignments ALTER COLUMN id SET DEFAULT nextval('public.student_assignments_id_seq'::regclass);


--
-- Name: student_deadlines id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_deadlines ALTER COLUMN id SET DEFAULT nextval('public.student_deadlines_id_seq'::regclass);


--
-- Name: student_goals id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_goals ALTER COLUMN id SET DEFAULT nextval('public.student_goals_id_seq'::regclass);


--
-- Name: student_profiles id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN id SET DEFAULT nextval('public.student_profiles_id_seq'::regclass);


--
-- Name: student_projects id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_projects ALTER COLUMN id SET DEFAULT nextval('public.student_projects_id_seq'::regclass);


--
-- Name: student_topics id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_topics ALTER COLUMN id SET DEFAULT nextval('public.student_topics_id_seq'::regclass);


--
-- Name: teacher_comments id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_comments ALTER COLUMN id SET DEFAULT nextval('public.teacher_comments_id_seq'::regclass);


--
-- Name: teacher_future_topics id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_future_topics ALTER COLUMN id SET DEFAULT nextval('public.teacher_future_topics_id_seq'::regclass);


--
-- Name: teacher_profiles id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_profiles ALTER COLUMN id SET DEFAULT nextval('public.teacher_profiles_id_seq'::regclass);


--
-- Name: teacher_research_directions id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_research_directions ALTER COLUMN id SET DEFAULT nextval('public.teacher_research_directions_id_seq'::regclass);


--
-- Name: teacher_students id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_students ALTER COLUMN id SET DEFAULT nextval('public.teacher_students_id_seq'::regclass);


--
-- Name: teacher_works id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_works ALTER COLUMN id SET DEFAULT nextval('public.teacher_works_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Name: user_chapters id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_chapters ALTER COLUMN id SET DEFAULT nextval('public.user_chapters_id_seq'::regclass);


--
-- Name: user_projects id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_projects ALTER COLUMN id SET DEFAULT nextval('public.user_projects_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: writing_statistics id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.writing_statistics ALTER COLUMN id SET DEFAULT nextval('public.writing_statistics_id_seq'::regclass);


--
-- Data for Name: available_places; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.available_places (id, teacher_id, type, available_spots, course, specialty_id, created_at, updated_at, max_students, requirements, description, current_students) FROM stdin;
633	1377	diploma	5	4	48	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання схемотехніки, основ мікроелектроніки	Проектування напівпровідникових приладів для сенсорних систем	0
634	1377	diploma	3	6	48	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	3	Бакалаврський диплом з електроніки, знання CAD систем	Дослідження нових матеріалів для мікроелектронних компонентів	0
635	1376	diploma	4	4	48	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Основи оптики та волоконної техніки	Проектування оптичних мереж для сенсорних систем	0
636	1376	coursework	8	3	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	8	Курс "Оптичні системи"	Розрахунок параметрів оптичних волокон	0
637	114	diploma	6	4	46	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	6	Знання комп'ютерних мереж, основ програмування	Розробка системи цифрової обробки сигналів	0
638	114	coursework	10	2	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	10	Курс "Інформаційні технології"	Проектування локальної мережі	0
639	1379	diploma	2	6	48	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Поглиблені знання оптики та матеріалознавства	Дослідження оптичних властивостей функціональних матеріалів	0
640	1378	diploma	4	4	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Основи електроніки, знання систем відображення	Проектування системи відображення інформації	0
641	104	diploma	5	4	48	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання сенсорних технологій, основ електроніки	Розробка оптичного сенсора для вимірювальної системи	0
642	104	coursework	8	3	48	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	8	Курс "Сенсорні системи"	Моделювання роботи оптичного сенсора	0
643	105	diploma	3	6	48	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	3	Досвід у вимірювальних системах, знання метрології	Розробка системи контролю якості оптичних приладів	0
644	78	diploma	4	4	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Основи лазерної техніки, квантової електроніки	Проектування лазерної системи	0
645	78	diploma	2	6	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Поглиблені знання оптики та квантової електроніки	Дослідження параметрів лазерних приладів	0
646	77	diploma	5	4	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання оптоелектроніки, основ фотоніки	Проектування оптоелектронної системи	0
647	570	diploma	4	4	48	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Основи оптоелектроніки, знання напівпровідникових приладів	Розробка світлодіодної системи	0
648	106	diploma	3	6	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	3	Поглиблені знання радіолокації та навігації	Дослідження радіоелектронних систем	0
649	573	diploma	5	4	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання РЧ-техніки, основ антен	Проектування антенної системи	0
650	1380	diploma	6	4	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	6	Знання схемотехніки, аналогової електроніки	Розробка аналогового електронного пристрою	0
651	1380	coursework	12	3	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	12	Курс "Електронні пристрої"	Проектування електронної схеми	0
652	1381	diploma	4	4	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Знання цифрової електроніки, основ ПЛІС	Проектування цифрової системи на ПЛІС	0
653	108	diploma	3	6	46	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	3	Досвід у телекомунікаціях	Дослідження телекомунікаційної системи	0
654	107	diploma	5	4	46	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання архітектури комп'ютерів	Проектування комп'ютерної системи	0
655	572	diploma	2	6	46	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Поглиблені знання цифрової обробки сигналів	Розробка алгоритмів цифрової обробки сигналів	0
656	571	diploma	6	4	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	6	Знання мікроконтролерів, основ програмування	Розробка вбудованої системи IoT	0
657	1382	diploma	3	6	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	3	Досвід системного програмування	Дослідження операційної системи	0
658	574	diploma	2	6	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Поглиблені знання квантової фізики	Дослідження квантової радіофізики	0
659	109	diploma	4	4	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Знання радіофізики, основ електродинаміки	Моделювання поширення радіохвиль	0
660	112	diploma	2	6	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Досвід у радіоастрономії	Дослідження астрофізичних явищ	0
661	1384	diploma	3	4	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	3	Знання нелінійної динаміки	Моделювання нелінійних систем	0
662	575	coursework	15	2	47	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	15	Курс "Електронні вимірювання"	Проектування вимірювальної установки	0
663	111	diploma	2	6	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Поглиблені знання теорії коливань	Дослідження динамічних систем	0
664	578	diploma	6	4	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	6	Знання Matlab, основ моделювання	Комп'ютерне моделювання фізичних процесів	0
665	578	coursework	10	3	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	10	Курс "Чисельні методи"	Розробка програмного забезпечення для моделювання	0
666	1385	diploma	5	4	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання алгоритмів, основ програмування	Розробка програмного забезпечення	0
739	50	coursework	10	3	8	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	10	Курс "Географія населення"	Дослідження географії населення	0
667	576	diploma	2	6	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Поглиблені знання фізики твердого тіла	Дослідження напівпровідникових матеріалів	0
668	110	diploma	4	4	45	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Знання радіофізики	Моделювання електромагнітних процесів	0
669	1383	diploma	5	4	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання математичного моделювання	Розробка програмного забезпечення для математичного моделювання	0
670	117	diploma	3	6	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	3	Досвід у кібербезпеці	Дослідження систем мережевої безпеки	0
671	579	diploma	5	4	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання UML, основ проектування ПЗ	Проектування архітектури програмного забезпечення	0
672	115	diploma	6	4	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	6	Знання SQL, основ баз даних	Проектування бази даних	0
673	115	coursework	12	3	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	12	Курс "Бази даних"	Розробка бази даних	0
674	119	diploma	2	6	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Досвід DevOps практик	Дослідження CI/CD pipeline	0
675	580	diploma	4	4	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Знання мобільної розробки	Розробка мобільного додатку	0
676	116	diploma	5	4	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	5	Знання веб-технологій, JavaScript	Розробка веб-додатку	0
677	582	diploma	4	4	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Знання тестування ПЗ	Розробка фреймворку для автоматизації тестування	0
678	113	diploma	3	6	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	3	Досвід управління проектами	Дослідження гнучких методологій розробки	0
679	118	diploma	4	4	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	4	Знання хмарних технологій	Розробка додатку для хмарної платформи	0
680	577	diploma	2	6	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Досвід системного аналізу	Проектування системної архітектури	0
681	583	diploma	2	6	44	2025-12-07 13:31:24.424706	2025-12-07 13:31:24.424706	2	Досвід машинного навчання	Дослідження алгоритмів штучного інтелекту	0
682	405	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання біофізики, основ фізіології	Дослідження транспортних процесів у клітинних мембранах	0
683	405	coursework	10	3	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	10	Курс "Клітинна біофізика"	Вивчення мембранних потенціалів	0
684	403	diploma	3	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання молекулярної біології, основи моделювання	Молекулярне моделювання біологічних процесів	0
685	403	diploma	2	6	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	2	Поглиблені знання біофізики, досвід програмування	Кінетика біологічних процесів	0
686	406	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання оптичних методів, основи мікроскопії	Застосування оптичних методів у біологічних дослідженнях	0
687	404	diploma	4	4	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання біоінформатики, основи програмування	Обчислювальний аналіз біомедичних даних	0
688	404	coursework	8	3	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	8	Курс "Обчислювальна біологія"	Структурна біоінформатика	0
689	27	diploma	3	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання радіаційної біології	Вплив фізичних факторів на біологічні системи	0
690	26	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання фізичних методів дослідження	Фізичні методи дослідження біомолекул	0
691	407	diploma	3	4	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання біоінформатики, основи програмування	Аналіз геномів та протеомів	0
692	407	diploma	2	6	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	2	Досвід у біоінформатиці, знання машинного навчання	Застосування машинного навчання в біології	0
693	408	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання біохімії, методи очистки білків	Дослідження біохімії білків	0
694	29	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання метаболізму, основи біохімії	Метаболізм вуглеводів та ліпідів	0
695	29	coursework	12	3	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	12	Курс "Біохімія клітинного дихання"	Вивчення клітинного дихання	0
696	409	diploma	3	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання ендокринології, сигнальних систем	Біохімія гормонів та сигнальних систем	0
697	30	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання клітинної біології, апоптозу	Клітинна біохімія та апоптоз	0
698	410	diploma	3	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання молекулярної біології, генетики	Біохімія нуклеїнових кислот	0
699	28	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання ензимології, кінетики реакцій	Ензимологія та кінетика ферментативних реакцій	0
700	411	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання нутриціології, біохімії вітамінів	Біохімія вітамінів та мікроелементів	0
701	32	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання альгології та мікології	Дослідження водоростей та грибів	0
702	413	diploma	3	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання екології рослин, фітоценології	Екологія рослин та фітоценологія	0
703	34	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання охорони природи, гербарної справи	Охорона рідкісних видів рослин	0
704	33	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання фізіології рослин, гормональної регуляції	Фізіологія рослин та рослинні гормони	0
705	33	coursework	10	3	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	10	Курс "Фізіологія рослин"	Дослідження рослинних гормонів	0
706	31	diploma	6	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	6	Знання систематики рослин, флористики	Систематика вищих рослин та флористика	0
707	412	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання морфології та анатомії рослин	Морфологія та анатомія рослин	0
708	37	diploma	3	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання популяційної генетики, еволюційного вчення	Популяційна генетика та еволюція	0
709	414	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання молекулярної генетики, геноміки	Молекулярна генетика та геноміка	0
710	415	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання цитогенетики, генетики людини	Цитогенетика та генетика людини	0
711	35	diploma	4	4	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання генетики мікроорганізмів, біотехнології	Генетика мікроорганізмів та біотехнологія	0
712	416	diploma	3	4	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання генетичної інженерії, методів рекомбінантних ДНК	Генетична інженерія та методи рекомбінантних ДНК	0
713	36	diploma	4	4	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання генетики рослин, селекції	Генетика рослин та селекція	0
714	43	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання гідробіології, екології безхребетних	Гідробіологія та екологія безхребетних	0
715	45	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання еволюційної зоології, філогенії	Еволюційна зоологія та філогенія тварин	0
716	42	diploma	6	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	6	Знання орнітології, етології	Орнітологія та етологія птахів	0
717	41	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання ентомології, паразитології	Ентомологія та паразитологія	0
718	423	diploma	3	4	4	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання екології хребетних, охорони тварин	Екологія наземних хребетних	0
719	421	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання теріології, фауністики	Теріологія та фауністика	0
720	422	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання іхтіології, морфології тварин	Іхтіологія та морфологія тварин	0
721	44	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання зоогеографії, географії тварин	Географія тварин та зоогеографія	0
722	46	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання медичної мікробіології, імунології	Медична мікробіологія та імунологія	0
723	427	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання вірусології, молекулярної біології	Вірусологія та молекулярна біологія вірусів	0
724	429	diploma	6	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	6	Знання ґрунтової мікробіології, агробіології	Ґрунтова мікробіологія та агробіологія	0
725	428	diploma	4	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання екологічної мікробіології	Екологічна мікробіологія та мікробні біоценози	0
726	426	diploma	5	4	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання загальної мікробіології, фізіології	Загальна мікробіологія та фізіологія мікроорганізмів	0
727	426	coursework	15	2	3	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	15	Курс "Загальна мікробіологія"	Основи мікробіології	0
728	48	diploma	3	4	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання генетики бактерій, біотехнології	Генетика бактерій та мікробна біотехнологія	0
729	47	diploma	4	4	5	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання промислової мікробіології, біотехнології	Промислова мікробіологія та біотехнологія	0
730	38	diploma	5	4	4	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання екології тварин, зоології	Екологія тварин та зоологія	0
731	40	diploma	4	4	4	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання охорони біорізноманіття, заповідної справи	Охорона біорізноманіття та заповідна справа	0
732	418	diploma	6	4	4	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	6	Знання промислової екології, охорони довкілля	Промислова екологія та охорона довкілля	0
733	417	diploma	4	4	4	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання загальної екології, моніторингу	Загальна екологія та екологічний моніторинг	0
734	419	diploma	3	4	4	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	3	Знання радіоекології, оцінки впливу	Радіоекологія та оцінка впливу на довкілля	0
735	39	diploma	5	4	4	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	5	Знання екології рослин, фітоіндикації	Екологія рослин та фітоіндикація	0
736	420	diploma	4	4	4	2025-12-07 13:44:35.166758	2025-12-07 13:44:35.166758	4	Знання екології мікроорганізмів	Екологія мікробіологічних систем	0
737	431	diploma	5	4	7	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання екологічної географії, оцінки природних ресурсів	Екологічна географія та геоекологія	0
738	50	diploma	4	4	8	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання соціально-економічної географії, урбаністики	Соціально-економічна географія та урбаністика	0
740	432	diploma	4	4	7	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання країнознавства, політичної географії	Країнознавство та політична географія	0
741	433	diploma	5	4	8	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання транспортної географії, логістики	Транспортна географія та логістика	0
742	49	diploma	6	4	7	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	6	Знання геоморфології, палеогеографії	Геоморфологія України та палеогеографія	0
743	51	diploma	5	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання туризмознавства, рекреаційної географії	Туризмознавство та рекреаційна географія	0
744	430	diploma	4	4	7	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання географії України, регіональної географії	Географія України та регіональна географія	0
745	55	diploma	4	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання палеогеографії, четвертинної геології	Палеогеографія та четвертинна геологія	0
746	58	diploma	3	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	3	Знання карстознавства, спелеології	Карстознавство та спелеологія	0
747	56	diploma	5	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання екзогенних процесів, денудації	Екзогенні процеси та денудація	0
748	439	diploma	4	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання геоморфологічного картографування, ГІС-аналізу	Геоморфологічне картографування та ГІС-аналіз рельєфу	0
749	438	diploma	6	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	6	Знання геоморфології, неотектоніки	Геоморфологія та неотектоніка	0
750	438	coursework	12	3	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	12	Курс "Геоморфологія"	Основи геоморфології	0
751	57	diploma	3	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	3	Знання морської геоморфології, берегових процесів	Морська геоморфологія та берегові процеси	0
752	441	diploma	4	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання гляціальної геоморфології, кріогенезу	Гляціальна геоморфологія та кріогенез	0
753	440	diploma	5	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання флювіальної геоморфології, річкових систем	Флювіальна геоморфологія та річкові системи	0
754	61	diploma	6	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	6	Знання культурного туризму, етнотуризму	Культурний туризм та етнотуризм	0
755	449	diploma	5	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання екскурсійної методики, музейної справи	Екскурсійна методика та інтерпретація культурної спадщини	0
756	448	diploma	4	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання організації масових заходів, event-менеджменту	Організація масових заходів та event-менеджмент	0
757	443	diploma	5	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання екскурсознавства, турівництва	Екскурсознавство та турівництво	0
758	62	diploma	6	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	6	Знання туристичного країнознавства, дестинаційного менеджменту	Туристичне країнознавство та дестинаційний менеджмент	0
759	444	diploma	5	4	14	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання рекреалогії, оздоровчого туризму	Рекреалогія та оздоровчий туризм	0
760	442	diploma	4	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання менеджменту туризму, туроператорської діяльності	Менеджмент туризму та туроператорська діяльність	0
761	60	diploma	5	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання спортивного туризму, альпінізму	Спортивний туризм та альпінізм	0
762	445	diploma	6	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	6	Знання екотуризму, сталого розвитку туризму	Екотуризм та сталий розвиток туризму	0
763	59	diploma	5	4	13	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання готельного бізнесу, ресторанної справи	Готельний бізнес та ресторанна справа	0
764	447	diploma	4	4	15	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання транспорту в туризмі, логістики	Транспорт у туризмі та логістика туристичних потоків	0
765	434	diploma	6	4	7	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	6	Знання загальної фізичної географії, кліматології	Загальна фізична географія та кліматологія	0
766	54	diploma	5	4	12	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання геоінформаційних систем, картографії	Геоінформаційні системи та картографія	0
767	54	coursework	15	2	12	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	15	Курс "ГІС-технології"	Основи геоінформаційних систем	0
768	52	diploma	4	4	7	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання океанології, гідрології суші	Океанологія та гідрологія суші	0
769	437	diploma	5	4	12	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	5	Знання геоекології, оцінки навколишнього середовища	Геоекологія та оцінка навколишнього середовища	0
770	436	diploma	4	4	10	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	4	Знання палеогеографії, четвертинної геології	Палеогеографія та еволюція ландшафтів	0
771	53	diploma	6	4	9	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	6	Знання біогеографії, географії ґрунтів	Біогеографія та географія ґрунтів	0
772	435	diploma	3	4	7	2025-12-07 13:54:34.669893	2025-12-07 13:54:34.669893	3	Знання гляціології, кріології	Гляціологія та кріологія	0
\.


--
-- Data for Name: chat_members; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.chat_members (id, chat_id, user_id, joined_at, is_muted, is_admin, unread_count) FROM stdin;
10	5	22	2025-10-18 23:41:57.001211	f	f	0
5	3	21	2025-10-16 21:21:57.46029	f	f	0
11	6	21	2025-10-19 00:02:52.10253	f	f	0
7	4	21	2025-10-16 22:01:08.320749	f	f	0
9	5	21	2025-10-18 23:41:56.999592	f	f	0
1	1	21	2025-10-15 22:06:49.673385	f	f	0
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.chat_messages (id, chat_id, sender_id, content, message_type, reply_to, attachment_data, is_pinned, is_edited, reactions, status, expires_at, created_at, updated_at) FROM stdin;
1	1	21	привіт 	text	\N	\N	f	f	{}	sent	\N	2025-10-15 22:07:02.58352	2025-10-15 22:07:02.58352
3	1	21	норм	text	\N	\N	f	f	{}	sent	\N	2025-10-15 22:11:49.649769	2025-10-15 22:11:49.649769
4	3	21	ghbdjjfjfkrd	text	\N	\N	f	f	{}	sent	\N	2025-10-16 21:22:12.243258	2025-10-16 21:22:12.243258
5	4	21	привіт	text	\N	\N	f	f	{}	sent	\N	2025-10-16 22:01:40.538679	2025-10-16 22:01:40.538679
7	4	21	попопопаьаьа	text	\N	\N	f	f	{}	sent	\N	2025-10-16 22:01:58.80757	2025-10-16 22:01:58.80757
8	4	21	ааьаьа	text	\N	\N	f	f	{}	sent	\N	2025-10-16 22:02:05.190812	2025-10-16 22:02:05.190812
10	4	21	ааааааа	text	\N	\N	f	f	{}	sent	\N	2025-10-16 22:24:25.102968	2025-10-16 22:24:25.102968
13	4	21	аабклатоа аотлв	text	\N	\N	f	f	{}	sent	\N	2025-10-16 22:24:38.172256	2025-10-16 22:24:38.172256
14	4	21	аьааьлвьтав	text	\N	\N	f	f	{}	sent	\N	2025-10-16 22:24:59.595652	2025-10-16 22:24:59.595652
15	4	21	vbbbmb nbc 	text	\N	\N	f	f	{}	sent	\N	2025-10-16 23:03:36.346405	2025-10-16 23:03:36.346405
16	4	21	j jm jh ,kb k	text	\N	\N	f	f	{}	sent	\N	2025-10-16 23:04:07.19459	2025-10-16 23:04:07.19459
19	4	21	fvkmfvmjvfvumvjmvfmv	text	\N	\N	f	f	{}	sent	\N	2025-10-16 23:04:27.55432	2025-10-16 23:04:27.55432
20	4	21	fkfvj,gv,jgbjbjk	text	\N	\N	f	f	{}	sent	\N	2025-10-16 23:04:31.145954	2025-10-16 23:04:31.145954
21	5	21	ghbfdns	text	\N	\N	f	f	{}	sent	\N	2025-10-18 23:42:10.305691	2025-10-18 23:42:10.305691
22	5	22	mgmgmktmf	text	\N	\N	f	f	{}	sent	\N	2025-10-18 23:43:52.876607	2025-10-18 23:43:52.876607
23	5	21	gggg.g.g.gff	text	\N	\N	f	f	{}	sent	\N	2025-10-18 23:44:16.634909	2025-10-18 23:44:16.634909
24	6	21	mvmmvmkdc	text	\N	\N	f	f	{}	sent	\N	2025-10-19 00:03:40.082341	2025-10-19 00:03:40.082341
26	4	21	fmfjgjvgnmgkfd	text	\N	\N	f	f	{}	sent	\N	2025-10-19 15:39:21.132715	2025-10-19 15:39:21.132715
27	4	21	fnfnfnfmdd	text	\N	\N	f	f	{}	sent	\N	2025-10-19 15:45:35.358433	2025-10-19 15:45:35.358433
28	4	21	fmfmmdmflmlcdls;cm	text	\N	\N	f	f	{}	sent	\N	2025-10-19 15:45:47.617842	2025-10-19 15:45:47.617842
29	4	21	bfgfgffvbfdDf	text	\N	\N	f	f	{}	sent	\N	2025-10-19 15:50:04.569072	2025-10-19 15:50:04.569072
30	6	21	vvmumvmvfkflkfcm dl	text	\N	\N	f	f	{}	sent	\N	2025-10-19 16:40:53.793499	2025-10-19 16:40:53.793499
31	6	21	vm mv md fas cfc	text	\N	\N	f	f	{}	sent	\N	2025-10-19 16:40:55.870093	2025-10-19 16:40:55.870093
32	6	21	f ck cv v	text	\N	\N	f	f	{}	sent	\N	2025-10-19 16:40:57.157074	2025-10-19 16:40:57.157074
33	6	21	jfdjnfknfskdnfjkdndlsknf gdf	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:09:47.572368	2025-10-25 14:09:47.572368
34	6	21	rejfilwcmlkfnclsndcfjej]\\	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:09:51.298139	2025-10-25 14:09:51.298139
35	6	21	rnfefnkjsnflksngvlnv	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:09:53.011461	2025-10-25 14:09:53.011461
36	6	21	fklermfkldmvlkmv lkmdfvlkm v	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:09:56.068376	2025-10-25 14:09:56.068376
37	6	21	nvkdnvlkdn vlkdnblkdnblkdnbld b	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:09:58.323437	2025-10-25 14:09:58.323437
38	6	21	mnvbdkbndjb dfnvksgbjksncfklsb vkjsn v	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:01.339066	2025-10-25 14:10:01.339066
39	6	21	vkjmkfnv djkfn dfn bvjfdnb	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:04.489595	2025-10-25 14:10:04.489595
40	6	21	vn kjvn dkjfn jdnbdkfbnlk	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:06.325648	2025-10-25 14:10:06.325648
41	6	21	vnkdjfbnldfbndkbndlgbndlknb	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:08.2085	2025-10-25 14:10:08.2085
42	6	21	 deb,dnbkdnblkdn	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:09.568376	2025-10-25 14:10:09.568376
43	6	21	dklvnkjdfvkn vlkamlksn kjcnv ksvn jfkcnv lksdnv kjdsfmnscsnvksjdzn kvjsvnknvzjklsngvslfn	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:20.992045	2025-10-25 14:10:20.992045
44	6	21	vjdsvknksnvdslkvnskvnlsknv kin vkasdvnkjdfnv kasdnvbkdjsfnikdegnbvkjlsefjneigreksfnvkjb glafskcmnvlaksgbksjfn alnegralf fgakfs	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:28.961034	2025-10-25 14:10:28.961034
45	6	21	jknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvnjknvjskdbvakjvbnak.elgnao;nvksenvn	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:43.578447	2025-10-25 14:10:43.578447
46	6	21	fn nkj 	text	\N	\N	f	f	{}	sent	\N	2025-10-25 14:10:48.427538	2025-10-25 14:10:48.427538
47	3	21	nf j jfdn jksncksn	text	\N	\N	f	f	{}	sent	\N	2025-10-25 15:10:55.08756	2025-10-25 15:10:55.08756
48	3	21	d Finn cln	text	\N	\N	f	f	{}	sent	\N	2025-10-25 15:10:57.131885	2025-10-25 15:10:57.131885
49	3	21	тплотмолтлостлост лсо	text	\N	\N	f	f	{}	sent	\N	2025-10-25 15:12:21.951334	2025-10-25 15:12:21.951334
\.


--
-- Data for Name: chat_participants; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.chat_participants (id, chat_id, user_id, joined_at) FROM stdin;
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.chats (id, name, type, avatar_url, description, last_message, last_message_at, created_by, created_at, updated_at) FROM stdin;
1	Bodya Dmytriv - Oleh Dzydz	private	\N	\N	норм	2025-10-15 22:11:49.654976	21	2025-10-15 22:06:49.652662	2025-10-15 22:06:49.652662
5	Olha Bermuda	private	\N	\N	gggg.g.g.gff	2025-10-18 23:44:16.636764	21	2025-10-18 23:41:56.991602	2025-10-18 23:41:56.991602
4	Oleh Rylskiy	private	\N	\N	bfgfgffvbfdDf	2025-10-19 15:50:04.5725	21	2025-10-16 22:01:08.318221	2025-10-16 22:01:08.318221
6	Ivan Osoba	private	\N	\N	fn nkj 	2025-10-25 14:10:48.430305	21	2025-10-19 00:02:52.099969	2025-10-19 00:02:52.099969
3	Viktoria Osoba	private	\N	\N	тплотмолтлостлост лсо	2025-10-25 15:12:21.957263	21	2025-10-16 21:21:57.45454	2025-10-16 21:21:57.45454
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.conversation_participants (conversation_id, user_id, last_seen) FROM stdin;
1aa3abc8-c329-4e88-957e-d2e7cb1d78b9	21	\N
1aa3abc8-c329-4e88-957e-d2e7cb1d78b9	7	\N
07a7a6d5-dcf5-45bb-ad4d-25584167ee2e	3	\N
07a7a6d5-dcf5-45bb-ad4d-25584167ee2e	7	\N
574b6dd9-bb20-43bb-b412-efd51337042a	4	\N
574b6dd9-bb20-43bb-b412-efd51337042a	21	2025-08-12 23:12:42.273744
2c95a725-72e8-433e-a3c8-aea95c5b6f63	21	\N
2c95a725-72e8-433e-a3c8-aea95c5b6f63	4	2025-08-12 23:21:04.816049
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.conversations (id, created_at, updated_at, title) FROM stdin;
1aa3abc8-c329-4e88-957e-d2e7cb1d78b9	2025-08-12 23:01:32.419699	2025-08-12 23:01:32.419699	Chat 8/12/2025
07a7a6d5-dcf5-45bb-ad4d-25584167ee2e	2025-08-12 23:02:16.291553	2025-08-12 23:02:16.291553	Chat 8/12/2025
574b6dd9-bb20-43bb-b412-efd51337042a	2025-08-12 23:12:32.200022	2025-08-12 23:12:32.200022	Chat 8/12/2025
2c95a725-72e8-433e-a3c8-aea95c5b6f63	2025-08-12 23:20:50.664009	2025-08-12 23:20:50.664009	Chat 8/12/2025
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.departments (id, faculty_id, name) FROM stdin;
1	1	біофізики та біоінформатики
2	1	біохімії
3	1	ботаніки
4	1	генетики та біотехнології
5	1	зоології та екології тварин
6	1	мікробіології
7	1	фізіології людини та тварин
8	1	фізіології та екології рослин
9	1	екології
10	2	географії України
11	2	геоморфології і палеографії
12	2	ґрунтознавства і географії ґрунтів
13	2	економічної і соціальної географії
14	2	конструктивної географії та картографії
15	2	раціонального використання природних ресурсів і охорони природи
16	2	туризму
17	2	фізичної географії
18	3	геології корисних копалин і геофізики
19	3	екологічної та інженерної геології і гідрогеології
20	3	загальної та історичної геології і палеонтології
21	3	мінералогіїї, петрографії і геохімії
22	4	аналітичної економії і міжнародної економіки
23	4	банківського і страхового бізнесу
24	4	економічної кібернетики
25	4	економіки України
26	4	інформаційниї систем в менеджменті
27	4	маркетингу
28	4	менеджменту
29	4	обліку і аудиту
30	4	статистики
31	4	фінансів, грошового обліку і кредиту
32	5	оптоелектроніки та інформаційних технологій
33	5	радіоелектронних і компʼютерних систем
34	5	радіофізики та компʼютерних технологій
35	5	системного проектування
36	5	сенсорної та напівпровідникової електроніки
37	5	фізичної і біомедичної електроніки
38	6	зарубіжної преси та інформації
39	6	мови засобів масової інформації
40	6	української преси
41	7	англійської філології
42	7	класичної філології
43	7	німецької філології
44	7	світової літератури
45	7	французької та іспанської філології
46	7	міжкультурної комунікації та перекладу
47	8	новітньої історії України
48	8	давньої історії України та архівознавства
49	8	історії середніх віків та візантиністики
50	8	нової та новітньої історії
51	8	історії словʼянських країн
52	8	етнології
53	8	історичного краєзнавства
54	8	арехології та історії стародавнього світу
55	8	соціології
56	9	музичне мистецтво
57	9	режисури та хореографії
58	9	соціокультурного менеджменту
59	9	театрознавства та акторської майстерності
60	10	алгебри та логіки
61	10	геометрії та топології
62	10	диференціальних рівнянь
63	10	математичної економіки і економетрії
64	10	математичного моделювання
65	10	математчного і функціонального аналізу
66	10	теорії функцій і теорії ймовірностей
67	10	теортичної та прикладної статистики
68	10	механіки
69	10	вищої математики
70	11	міжнародного права
71	11	міжнародних економічних відносин
72	11	іноземних мов факультету міжнародних відносин
73	11	країнознавства і міжнародного туризму
74	11	міжнародних відносин і дипломатичної служби
75	11	міжнародного економічного аналізу і фінансів
76	11	європейського права
77	12	загальної педагогіки та педагогіки вищої школи
78	12	початкової та дошкільної освіти
79	12	соціальної педагогіки та соціальної роботи
80	12	соціальної освіти
81	12	фізичного виховання та спорту
82	13	обчислювальної математики
83	13	прикладної математики
84	13	теорії оптимальних процесів
85	13	програмування
86	13	інформаційних систем
87	13	математичного моделювання соціально-економічних процесів
88	13	дискретного аналізу та інтелектуальних систем
89	13	кібербезпеки
90	14	економіки та публічного управління
91	14	обліку, аналізу і контролю
92	14	публічного адміністрування та управління бізнесом
93	14	фінансових технологій та консалтингу
94	14	фінансового менеджменту
95	14	цифрової економіки та бізнес-аналітики
96	15	астрофізики
97	15	експериментальної фізики
98	15	загальної фізики
99	15	фізики металів
100	16	загального мовознавства
101	16	польської філології
102	16	словʼянської філології
103	16	сходознавства
104	16	української літератури
105	17	історії філософії
106	17	політології
107	17	психології
108	17	теорії та історії культури
109	17	теорії та історії політичної науки
110	17	філософії
111	18	аналітичної хімії
112	18	органічної хімії
113	18	неорганічної хімії
114	19	адміністративного та фінансового права
115	19	конституційного права
116	19	кримінального процесу і криміналістики
117	19	соціального права
118	19	цивільного права та процесу
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.events (id, "userEmail", title, date, type, "time", location, link, description, completed) FROM stdin;
1	vmmgkk@lnu.edu.ua	dddd	2025-08-09 23:53:59.435+03	deadline	\N	\N	\N	\N	f
2	vnvnfje@lnu.edu.ua	dddd	2025-08-09 00:00:00+03	task	\N	\N	\N	\N	f
4	vmmgkk@lnu.edu.ua	rrrr	2025-08-12 11:35:43.494+03	meeting	\N	\N	\N	\N	f
5	vmmgkk@lnu.edu.ua	eewwdff	2025-08-12 11:36:04.027+03	task	\N	\N	\N	\N	f
6	viksjjfhr@lnu.edu.ua	ааа	2025-08-14 00:00:00+03	task	\N	\N	\N	\N	f
22	Olha.Bermuda@lnu.edu.ua	ccccc	2025-10-28 09:00:00+02	task	09:00				f
21	Olha.Bermuda@lnu.edu.ua	7777	2025-10-29 21:00:00+02	task	21:00				f
20	Olha.Bermuda@lnu.edu.ua	ddddd222	2025-10-31 09:00:00+02	task	09:00				f
19	Olha.Bermuda@lnu.edu.ua	ggggggbbbbb	2025-10-30 12:00:00+02	deadline	12:00				t
17	Olha.Bermuda@lnu.edu.ua	fghhh	2025-10-30 12:00:00+02	task	12:00				t
23	Olha.Bermuda@lnu.edu.ua	mm	2025-10-30 09:00:00+02	task	09:00				t
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.faculties (id, name) FROM stdin;
1	Біологічний факультет
2	Географічний факультет
3	Геологічний факультет
4	Економічний факультет
5	Факультет електроніки та компʼютерних технологій
6	Факультет журналістики
7	Факультет іноземних мов
8	Історичний факультет
9	Факультет культури і мистецтв
10	Механіко-математичний факультет
11	Факультет міжнародних відносин
12	Факультет педагогічної освіти
13	Факультет прикладної математики та інформатики
14	Факультет управління фінансами та бізнесу
15	Фізичний факультет
16	Філологічний факультет
17	Філософський факультет
18	Хімічний факультет
19	Юридичний факультет
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.groups (id, name, course, specialty_id, education_level) FROM stdin;
1	ФЕП-11	1	44	бакалавр
2	ФЕП-12	1	44	бакалавр
3	ФЕП-13	1	44	бакалавр
4	ФЕП-21	2	44	бакалавр
5	ФЕП-22	2	44	бакалавр
6	ФЕП-31	3	44	бакалавр
7	ФЕП-32	3	44	бакалавр
8	ФЕП-41	4	44	бакалавр
9	ФЕП-42	4	44	бакалавр
10	ФЕП-М1	1	44	магістр
11	ФеІ-11	1	45	бакалавр
12	ФеІ-12	1	45	бакалавр
13	ФеІ-13	1	45	бакалавр
14	ФеІ-21	2	45	бакалавр
15	ФеІ-22	2	45	бакалавр
16	ФеІ-31	3	45	бакалавр
17	ФеІ-32	3	45	бакалавр
18	ФеІ-41	4	45	бакалавр
19	ФеІ-42	4	45	бакалавр
20	ФеІ-М1	1	45	магістр
21	ФЕС-11	1	46	бакалавр
22	ФЕС-12	1	46	бакалавр
23	ФЕС-21	2	46	бакалавр
24	ФЕС-22	2	46	бакалавр
25	ФЕС-31	3	46	бакалавр
26	ФЕС-32	3	46	бакалавр
27	ФЕС-41	4	46	бакалавр
28	ФЕС-42	4	46	бакалавр
29	ФЕС-М1	1	46	магістр
30	ФЕЛ-11	1	47	бакалавр
31	ФЕЛ-12	1	47	бакалавр
32	ФЕЛ-21	2	47	бакалавр
33	ФЕЛ-22	2	47	бакалавр
34	ФЕЛ-31	3	47	бакалавр
35	ФЕЛ-32	3	47	бакалавр
36	ФЕЛ-41	4	47	бакалавр
37	ФЕЛ-42	4	47	бакалавр
38	ФЕЛ-М1	1	47	магістр
39	ФЕМ-11	1	48	бакалавр
40	ФЕМ-12	1	48	бакалавр
41	ФЕМ-21	2	48	бакалавр
42	ФЕМ-22	2	48	бакалавр
43	ФЕМ-31	3	48	бакалавр
44	ФЕМ-32	3	48	бакалавр
45	ФЕМ-41	4	48	бакалавр
46	ФЕМ-42	4	48	бакалавр
47	ФЕМ-М1	1	48	магістр
48	БСО-11	1	1	бакалавр
49	БСО-12	1	1	бакалавр
50	БСО-21	2	1	бакалавр
51	БСО-22	2	1	бакалавр
52	БСО-31	3	1	бакалавр
53	БСО-32	3	1	бакалавр
54	БСО-41	4	1	бакалавр
55	БСО-42	4	1	бакалавр
56	БСО-М1	1	1	магістр
57	БПН-11	1	2	бакалавр
58	БПН-12	1	2	бакалавр
59	БПН-21	2	2	бакалавр
60	БПН-22	2	2	бакалавр
61	БПН-31	3	2	бакалавр
62	БПН-32	3	2	бакалавр
63	БПН-41	4	2	бакалавр
64	БПН-42	4	2	бакалавр
65	БПН-М1	1	2	магістр
66	ББ-11	1	3	бакалавр
67	ББ-12	1	3	бакалавр
68	ББ-13	1	3	бакалавр
69	ББ-21	2	3	бакалавр
70	ББ-22	2	3	бакалавр
71	ББ-31	3	3	бакалавр
72	ББ-32	3	3	бакалавр
73	ББ-41	4	3	бакалавр
74	ББ-42	4	3	бакалавр
75	ББ-М1	1	3	магістр
76	БЕ-11	1	4	бакалавр
77	БЕ-12	1	4	бакалавр
78	БЕ-21	2	4	бакалавр
79	БЕ-22	2	4	бакалавр
80	БЕ-31	3	4	бакалавр
81	БЕ-32	3	4	бакалавр
82	БЕ-41	4	4	бакалавр
83	БЕ-42	4	4	бакалавр
84	БЕ-М1	1	4	магістр
85	БТ-11	1	5	бакалавр
86	БТ-12	1	5	бакалавр
87	БТ-21	2	5	бакалавр
88	БТ-22	2	5	бакалавр
89	БТ-31	3	5	бакалавр
90	БТ-32	3	5	бакалавр
91	БТ-41	4	5	бакалавр
92	БТ-42	4	5	бакалавр
93	БТ-М1	1	5	магістр
94	ГСО-11	1	6	бакалавр
95	ГСО-12	1	6	бакалавр
96	ГСО-21	2	6	бакалавр
97	ГСО-22	2	6	бакалавр
98	ГСО-31	3	6	бакалавр
99	ГСО-32	3	6	бакалавр
100	ГСО-41	4	6	бакалавр
101	ГСО-42	4	6	бакалавр
102	ГСО-М1	1	6	магістр
103	ГРС-11	1	7	бакалавр
104	ГРС-12	1	7	бакалавр
105	ГРС-21	2	7	бакалавр
106	ГРС-22	2	7	бакалавр
107	ГРС-31	3	7	бакалавр
108	ГРС-32	3	7	бакалавр
109	ГРС-41	4	7	бакалавр
110	ГРС-42	4	7	бакалавр
111	ГРС-М1	1	7	магістр
112	ГУ-11	1	8	бакалавр
113	ГУ-12	1	8	бакалавр
114	ГУ-21	2	8	бакалавр
115	ГУ-22	2	8	бакалавр
116	ГУ-31	3	8	бакалавр
117	ГУ-32	3	8	бакалавр
118	ГУ-41	4	8	бакалавр
119	ГУ-42	4	8	бакалавр
120	ГУ-М1	1	8	магістр
121	ГЛЦ-11	1	16	бакалавр
122	ГЛЦ-12	1	16	бакалавр
123	ГЛЦ-21	2	16	бакалавр
124	ГЛЦ-22	2	16	бакалавр
125	ГЛЦ-31	3	16	бакалавр
126	ГЛЦ-32	3	16	бакалавр
127	ГЛЦ-41	4	16	бакалавр
128	ГЛЦ-42	4	16	бакалавр
129	ГЛЦ-М1	1	16	магістр
130	ГЛІ-11	1	17	бакалавр
131	ГЛІ-12	1	17	бакалавр
132	ГЛІ-21	2	17	бакалавр
133	ГЛІ-22	2	17	бакалавр
134	ГЛІ-31	3	17	бакалавр
135	ГЛІ-32	3	17	бакалавр
136	ГЛІ-41	4	17	бакалавр
137	ГЛІ-42	4	17	бакалавр
138	ГЛІ-М1	1	17	магістр
139	ГЛН-11	1	18	бакалавр
140	ГЛН-12	1	18	бакалавр
141	ГЛН-21	2	18	бакалавр
142	ГЛН-22	2	18	бакалавр
143	ГЛН-31	3	18	бакалавр
144	ГЛН-32	3	18	бакалавр
145	ГЛН-41	4	18	бакалавр
146	ГЛН-42	4	18	бакалавр
147	ГЛН-М1	1	18	магістр
148	ЕКЗ-11	1	19	бакалавр
149	ЕКЗ-12	1	19	бакалавр
150	ЕКЗ-21	2	19	бакалавр
151	ЕКЗ-22	2	19	бакалавр
152	ЕКЗ-31	3	19	бакалавр
153	ЕКЗ-32	3	19	бакалавр
154	ЕКЗ-41	4	19	бакалавр
155	ЕКЗ-42	4	19	бакалавр
156	ЕКЗ-М1	1	19	магістр
157	ЕКА-11	1	20	бакалавр
158	ЕКА-12	1	20	бакалавр
159	ЕКА-21	2	20	бакалавр
160	ЕКА-22	2	20	бакалавр
161	ЕКА-31	3	20	бакалавр
162	ЕКА-32	3	20	бакалавр
163	ЕКА-41	4	20	бакалавр
164	ЕКА-42	4	20	бакалавр
165	ЕКА-М1	1	20	магістр
166	МНА-11	1	26	бакалавр
167	МНА-12	1	26	бакалавр
168	МНА-21	2	26	бакалавр
169	МНА-22	2	26	бакалавр
170	МНА-31	3	26	бакалавр
171	МНА-32	3	26	бакалавр
172	МНА-41	4	26	бакалавр
173	МНА-42	4	26	бакалавр
174	МНА-М1	1	26	магістр
175	ІСО-11	1	33	бакалавр
176	ІСО-12	1	33	бакалавр
177	ІСО-21	2	33	бакалавр
178	ІСО-22	2	33	бакалавр
179	ІСО-31	3	33	бакалавр
180	ІСО-32	3	33	бакалавр
181	ІСО-41	4	33	бакалавр
182	ІСО-42	4	33	бакалавр
183	ІСО-М1	1	33	магістр
184	ІА-11	1	35	бакалавр
185	ІА-12	1	35	бакалавр
186	ІА-21	2	35	бакалавр
187	ІА-22	2	35	бакалавр
188	ІА-31	3	35	бакалавр
189	ІА-32	3	35	бакалавр
190	ІА-41	4	35	бакалавр
191	ІА-42	4	35	бакалавр
192	ІА-М1	1	35	магістр
193	ІС-11	1	36	бакалавр
194	ІС-12	1	36	бакалавр
195	ІС-21	2	36	бакалавр
196	ІС-22	2	36	бакалавр
197	ІС-31	3	36	бакалавр
198	ІС-32	3	36	бакалавр
199	ІС-41	4	36	бакалавр
200	ІС-42	4	36	бакалавр
201	ІС-М1	1	36	магістр
202	МСО-11	1	37	бакалавр
203	МСО-12	1	37	бакалавр
204	МСО-21	2	37	бакалавр
205	МСО-22	2	37	бакалавр
206	МСО-31	3	37	бакалавр
207	МСО-32	3	37	бакалавр
208	МСО-41	4	37	бакалавр
209	МСО-42	4	37	бакалавр
210	МСО-М1	1	37	магістр
211	МАК-11	1	38	бакалавр
212	МАК-12	1	38	бакалавр
213	МАК-21	2	38	бакалавр
214	МАК-22	2	38	бакалавр
215	МАК-31	3	38	бакалавр
216	МАК-32	3	38	бакалавр
217	МАК-41	4	38	бакалавр
218	МАК-42	4	38	бакалавр
219	МАК-М1	1	38	магістр
220	МПА-11	1	41	бакалавр
221	МПА-12	1	41	бакалавр
222	МПА-21	2	41	бакалавр
223	МПА-22	2	41	бакалавр
224	МПА-31	3	41	бакалавр
225	МПА-32	3	41	бакалавр
226	МПА-41	4	41	бакалавр
227	МПА-42	4	41	бакалавр
228	МПА-М1	1	41	магістр
229	ЖЖ-11	1	49	бакалавр
230	ЖЖ-12	1	49	бакалавр
231	ЖЖ-21	2	49	бакалавр
232	ЖЖ-22	2	49	бакалавр
233	ЖЖ-31	3	49	бакалавр
234	ЖЖ-32	3	49	бакалавр
235	ЖЖ-41	4	49	бакалавр
236	ЖЖ-42	4	49	бакалавр
237	ЖЖ-М1	1	49	магістр
238	ЖМ-11	1	50	бакалавр
239	ЖМ-12	1	50	бакалавр
240	ЖМ-21	2	50	бакалавр
241	ЖМ-22	2	50	бакалавр
242	ЖМ-31	3	50	бакалавр
243	ЖМ-32	3	50	бакалавр
244	ЖМ-41	4	50	бакалавр
245	ЖМ-42	4	50	бакалавр
246	ЖМ-М1	1	50	магістр
247	ФАА-11	1	51	бакалавр
248	ФАА-12	1	51	бакалавр
249	ФАА-21	2	51	бакалавр
250	ФАА-22	2	51	бакалавр
251	ФАА-31	3	51	бакалавр
252	ФАА-32	3	51	бакалавр
253	ФАА-41	4	51	бакалавр
254	ФАА-42	4	51	бакалавр
255	ФАА-М1	1	51	магістр
256	ФАП-11	1	52	бакалавр
257	ФАП-12	1	52	бакалавр
258	ФАП-21	2	52	бакалавр
259	ФАП-22	2	52	бакалавр
260	ФАП-31	3	52	бакалавр
261	ФАП-32	3	52	бакалавр
262	ФАП-41	4	52	бакалавр
263	ФАП-42	4	52	бакалавр
264	ФАП-М1	1	52	магістр
265	ФФА-11	1	56	бакалавр
266	ФФА-12	1	56	бакалавр
267	ФФА-21	2	56	бакалавр
268	ФФА-22	2	56	бакалавр
269	ФФА-31	3	56	бакалавр
270	ФФА-32	3	56	бакалавр
271	ФФА-41	4	56	бакалавр
272	ФФА-42	4	56	бакалавр
273	ФФА-М1	1	56	магістр
274	ГҐР-11	1	9	бакалавр
275	ГҐР-12	1	9	бакалавр
276	ГҐР-21	2	9	бакалавр
277	ГҐР-22	2	9	бакалавр
278	ГҐР-31	3	9	бакалавр
279	ГҐР-32	3	9	бакалавр
280	ГҐР-41	4	9	бакалавр
281	ГҐР-42	4	9	бакалавр
282	ГҐР-М1	1	9	магістр
283	ГРГ-11	1	10	бакалавр
284	ГРГ-12	1	10	бакалавр
285	ГРГ-21	2	10	бакалавр
286	ГРГ-22	2	10	бакалавр
287	ГРГ-31	3	10	бакалавр
288	ГРГ-32	3	10	бакалавр
289	ГРГ-41	4	10	бакалавр
290	ГРГ-42	4	10	бакалавр
291	ГРГ-М1	1	10	магістр
292	ГХТ-11	1	11	бакалавр
293	ГХТ-12	1	11	бакалавр
294	ГХТ-21	2	11	бакалавр
295	ГХТ-22	2	11	бакалавр
296	ГХТ-31	3	11	бакалавр
297	ГХТ-32	3	11	бакалавр
298	ГХТ-41	4	11	бакалавр
299	ГХТ-42	4	11	бакалавр
300	ГХТ-М1	1	11	магістр
301	ГГТ-11	1	12	бакалавр
302	ГГТ-12	1	12	бакалавр
303	ГГТ-21	2	12	бакалавр
304	ГГТ-22	2	12	бакалавр
305	ГГТ-31	3	12	бакалавр
306	ГГТ-32	3	12	бакалавр
307	ГГТ-41	4	12	бакалавр
308	ГГТ-42	4	12	бакалавр
309	ГГТ-М1	1	12	магістр
310	ГГР-11	1	13	бакалавр
311	ГГР-12	1	13	бакалавр
312	ГГР-21	2	13	бакалавр
313	ГГР-22	2	13	бакалавр
314	ГГР-31	3	13	бакалавр
315	ГГР-32	3	13	бакалавр
316	ГГР-41	4	13	бакалавр
317	ГГР-42	4	13	бакалавр
318	ГГР-М1	1	13	магістр
319	ГРД-11	1	14	бакалавр
320	ГРД-12	1	14	бакалавр
321	ГРД-21	2	14	бакалавр
322	ГРД-22	2	14	бакалавр
323	ГРД-31	3	14	бакалавр
324	ГРД-32	3	14	бакалавр
325	ГРД-41	4	14	бакалавр
326	ГРД-42	4	14	бакалавр
327	ГРД-М1	1	14	магістр
328	ГТД-11	1	15	бакалавр
329	ГТД-12	1	15	бакалавр
330	ГТД-21	2	15	бакалавр
331	ГТД-22	2	15	бакалавр
332	ГТД-31	3	15	бакалавр
333	ГТД-32	3	15	бакалавр
334	ГТД-41	4	15	бакалавр
335	ГТД-42	4	15	бакалавр
336	ГТД-М1	1	15	магістр
337	ІМУ-11	1	34	бакалавр
338	ІМУ-12	1	34	бакалавр
339	ІМУ-21	2	34	бакалавр
340	ІМУ-22	2	34	бакалавр
341	ІМУ-31	3	34	бакалавр
342	ІМУ-32	3	34	бакалавр
343	ІМУ-41	4	34	бакалавр
344	ІМУ-42	4	34	бакалавр
345	ІМУ-М1	1	34	магістр
346	ЕКК-11	1	21	бакалавр
347	ЕКК-12	1	21	бакалавр
348	ЕКК-21	2	21	бакалавр
349	ЕКК-22	2	21	бакалавр
350	ЕКК-31	3	21	бакалавр
351	ЕКК-32	3	21	бакалавр
352	ЕКК-41	4	21	бакалавр
353	ЕКК-42	4	21	бакалавр
354	ЕКК-М1	1	21	магістр
355	ЕМЕ-11	1	22	бакалавр
356	ЕМЕ-12	1	22	бакалавр
357	ЕМЕ-21	2	22	бакалавр
358	ЕМЕ-22	2	22	бакалавр
359	ЕМЕ-31	3	22	бакалавр
360	ЕМЕ-32	3	22	бакалавр
361	ЕМЕ-41	4	22	бакалавр
362	ЕМЕ-42	4	22	бакалавр
363	ЕМЕ-М1	1	22	магістр
364	ЕДО-11	1	23	бакалавр
365	ЕДО-12	1	23	бакалавр
366	ЕДО-21	2	23	бакалавр
367	ЕДО-22	2	23	бакалавр
368	ЕДО-31	3	23	бакалавр
369	ЕДО-32	3	23	бакалавр
370	ЕДО-41	4	23	бакалавр
371	ЕДО-42	4	23	бакалавр
372	ЕДО-М1	1	23	магістр
373	ЕОА-11	1	24	бакалавр
374	ЕОА-12	1	24	бакалавр
375	ЕОА-21	2	24	бакалавр
376	ЕОА-22	2	24	бакалавр
377	ЕОА-31	3	24	бакалавр
378	ЕОА-32	3	24	бакалавр
379	ЕОА-41	4	24	бакалавр
380	ЕОА-42	4	24	бакалавр
381	ЕОА-М1	1	24	магістр
382	ЕФБ-11	1	25	бакалавр
383	ЕФБ-12	1	25	бакалавр
384	ЕФБ-21	2	25	бакалавр
385	ЕФБ-22	2	25	бакалавр
386	ЕФБ-31	3	25	бакалавр
387	ЕФБ-32	3	25	бакалавр
388	ЕФБ-41	4	25	бакалавр
389	ЕФБ-42	4	25	бакалавр
390	ЕФБ-М1	1	25	магістр
391	ЕУБ-11	1	27	бакалавр
392	ЕУБ-12	1	27	бакалавр
393	ЕУБ-21	2	27	бакалавр
394	ЕУБ-22	2	27	бакалавр
395	ЕУБ-31	3	27	бакалавр
396	ЕУБ-32	3	27	бакалавр
397	ЕУБ-41	4	27	бакалавр
398	ЕУБ-42	4	27	бакалавр
399	ЕУБ-М1	1	27	магістр
400	ЕЦУ-11	1	28	бакалавр
401	ЕЦУ-12	1	28	бакалавр
402	ЕЦУ-21	2	28	бакалавр
403	ЕЦУ-22	2	28	бакалавр
404	ЕЦУ-31	3	28	бакалавр
405	ЕЦУ-32	3	28	бакалавр
406	ЕЦУ-41	4	28	бакалавр
407	ЕЦУ-42	4	28	бакалавр
408	ЕЦУ-М1	1	28	магістр
409	ЕМК-11	1	29	бакалавр
410	ЕМК-12	1	29	бакалавр
411	ЕМК-21	2	29	бакалавр
412	ЕМК-22	2	29	бакалавр
413	ЕМК-31	3	29	бакалавр
414	ЕМК-32	3	29	бакалавр
415	ЕМК-41	4	29	бакалавр
416	ЕМК-42	4	29	бакалавр
417	ЕМК-М1	1	29	магістр
418	ЕЛТ-11	1	30	бакалавр
419	ЕЛТ-12	1	30	бакалавр
420	ЕЛТ-21	2	30	бакалавр
421	ЕЛТ-22	2	30	бакалавр
422	ЕЛТ-31	3	30	бакалавр
423	ЕЛТ-32	3	30	бакалавр
424	ЕЛТ-41	4	30	бакалавр
425	ЕЛТ-42	4	30	бакалавр
426	ЕЛТ-М1	1	30	магістр
427	ЕСЗ-11	1	31	бакалавр
428	ЕСЗ-12	1	31	бакалавр
429	ЕСЗ-21	2	31	бакалавр
430	ЕСЗ-22	2	31	бакалавр
431	ЕСЗ-31	3	31	бакалавр
432	ЕСЗ-32	3	31	бакалавр
433	ЕСЗ-41	4	31	бакалавр
434	ЕСЗ-42	4	31	бакалавр
435	ЕСЗ-М1	1	31	магістр
436	ЕБЕ-11	1	32	бакалавр
437	ЕБЕ-12	1	32	бакалавр
438	ЕБЕ-21	2	32	бакалавр
439	ЕБЕ-22	2	32	бакалавр
440	ЕБЕ-31	3	32	бакалавр
441	ЕБЕ-32	3	32	бакалавр
442	ЕБЕ-41	4	32	бакалавр
443	ЕБЕ-42	4	32	бакалавр
444	ЕБЕ-М1	1	32	магістр
445	МАМ-11	1	39	бакалавр
446	МАМ-12	1	39	бакалавр
447	МАМ-21	2	39	бакалавр
448	МАМ-22	2	39	бакалавр
449	МАМ-31	3	39	бакалавр
450	МАМ-32	3	39	бакалавр
451	МАМ-41	4	39	бакалавр
452	МАМ-42	4	39	бакалавр
453	МАМ-М1	1	39	магістр
454	МЕО-11	1	40	бакалавр
455	МЕО-12	1	40	бакалавр
456	МЕО-21	2	40	бакалавр
457	МЕО-22	2	40	бакалавр
458	МЕО-31	3	40	бакалавр
459	МЕО-32	3	40	бакалавр
460	МЕО-41	4	40	бакалавр
461	МЕО-42	4	40	бакалавр
462	МЕО-М1	1	40	магістр
463	МСА-11	1	42	бакалавр
464	МСА-12	1	42	бакалавр
465	МСА-21	2	42	бакалавр
466	МСА-22	2	42	бакалавр
467	МСА-31	3	42	бакалавр
468	МСА-32	3	42	бакалавр
469	МСА-41	4	42	бакалавр
470	МСА-42	4	42	бакалавр
471	МСА-М1	1	42	магістр
472	МІТ-11	1	43	бакалавр
473	МІТ-12	1	43	бакалавр
474	МІТ-21	2	43	бакалавр
475	МІТ-22	2	43	бакалавр
476	МІТ-31	3	43	бакалавр
477	МІТ-32	3	43	бакалавр
478	МІТ-41	4	43	бакалавр
479	МІТ-42	4	43	бакалавр
480	МІТ-М1	1	43	магістр
481	ФНА-11	1	53	бакалавр
482	ФНА-12	1	53	бакалавр
483	ФНА-21	2	53	бакалавр
484	ФНА-22	2	53	бакалавр
485	ФНА-31	3	53	бакалавр
486	ФНА-32	3	53	бакалавр
487	ФНА-41	4	53	бакалавр
488	ФНА-42	4	53	бакалавр
489	ФНА-М1	1	53	магістр
490	ФНП-11	1	54	бакалавр
491	ФНП-12	1	54	бакалавр
492	ФНП-21	2	54	бакалавр
493	ФНП-22	2	54	бакалавр
494	ФНП-31	3	54	бакалавр
495	ФНП-32	3	54	бакалавр
496	ФНП-41	4	54	бакалавр
497	ФНП-42	4	54	бакалавр
498	ФНП-М1	1	54	магістр
499	ФІС-11	1	55	бакалавр
500	ФІС-12	1	55	бакалавр
501	ФІС-21	2	55	бакалавр
502	ФІС-22	2	55	бакалавр
503	ФІС-31	3	55	бакалавр
504	ФІС-32	3	55	бакалавр
505	ФІС-41	4	55	бакалавр
506	ФІС-42	4	55	бакалавр
507	ФІС-М1	1	55	магістр
508	ФКФ-11	1	57	бакалавр
509	ФКФ-12	1	57	бакалавр
510	ФКФ-21	2	57	бакалавр
511	ФКФ-22	2	57	бакалавр
512	ФКФ-31	3	57	бакалавр
513	ФКФ-32	3	57	бакалавр
514	ФКФ-41	4	57	бакалавр
515	ФКФ-42	4	57	бакалавр
516	ФКФ-М1	1	57	магістр
517	КІБ-11	1	60	бакалавр
518	КІБ-12	1	60	бакалавр
519	КІБ-21	2	60	бакалавр
520	КІБ-22	2	60	бакалавр
521	КІБ-31	3	60	бакалавр
522	КІБ-32	3	60	бакалавр
523	КІБ-41	4	60	бакалавр
524	КІБ-42	4	60	бакалавр
525	КІБ-М1	1	60	магістр
526	КХД-11	1	61	бакалавр
527	КХД-12	1	61	бакалавр
528	КХД-21	2	61	бакалавр
529	КХД-22	2	61	бакалавр
530	КХД-31	3	61	бакалавр
531	КХД-32	3	61	бакалавр
532	КХД-41	4	61	бакалавр
533	КХД-42	4	61	бакалавр
534	КХД-М1	1	61	магістр
535	КАЛ-11	1	63	бакалавр
536	КАЛ-12	1	63	бакалавр
537	КАЛ-21	2	63	бакалавр
538	КАЛ-22	2	63	бакалавр
539	КАЛ-31	3	63	бакалавр
540	КАЛ-32	3	63	бакалавр
541	КАЛ-41	4	63	бакалавр
542	КАЛ-42	4	63	бакалавр
543	КАЛ-М1	1	63	магістр
544	КТЗ-11	1	64	бакалавр
545	КТЗ-12	1	64	бакалавр
546	КТЗ-21	2	64	бакалавр
547	КТЗ-22	2	64	бакалавр
548	КТЗ-31	3	64	бакалавр
549	КТЗ-32	3	64	бакалавр
550	КТЗ-41	4	64	бакалавр
551	КТЗ-42	4	64	бакалавр
552	КТЗ-М1	1	64	магістр
553	КХР-11	1	65	бакалавр
554	КХР-12	1	65	бакалавр
555	КХР-21	2	65	бакалавр
556	КХР-22	2	65	бакалавр
557	КХР-31	3	65	бакалавр
558	КХР-32	3	65	бакалавр
559	КХР-41	4	65	бакалавр
560	КХР-42	4	65	бакалавр
561	КХР-М1	1	65	магістр
562	МКП-11	1	66	бакалавр
563	МКП-12	1	66	бакалавр
564	МКП-21	2	66	бакалавр
565	МКП-22	2	66	бакалавр
566	МКП-31	3	66	бакалавр
567	МКП-32	3	66	бакалавр
568	МКП-41	4	66	бакалавр
569	МКП-42	4	66	бакалавр
570	МКП-М1	1	66	магістр
571	МЕВ-11	1	67	бакалавр
572	МЕВ-12	1	67	бакалавр
573	МЕВ-21	2	67	бакалавр
574	МЕВ-22	2	67	бакалавр
575	МЕВ-31	3	67	бакалавр
576	МЕВ-32	3	67	бакалавр
577	МЕВ-41	4	67	бакалавр
578	МЕВ-42	4	67	бакалавр
579	МЕВ-М1	1	67	магістр
580	МБА-11	1	69	бакалавр
581	МБА-12	1	69	бакалавр
582	МБА-21	2	69	бакалавр
583	МБА-22	2	69	бакалавр
584	МБА-31	3	69	бакалавр
585	МБА-32	3	69	бакалавр
586	МБА-41	4	69	бакалавр
587	МБА-42	4	69	бакалавр
588	МБА-М1	1	69	магістр
589	МІН-11	1	70	бакалавр
590	МІН-12	1	70	бакалавр
591	МІН-21	2	70	бакалавр
592	МІН-22	2	70	бакалавр
593	МІН-31	3	70	бакалавр
594	МІН-32	3	70	бакалавр
595	МІН-41	4	70	бакалавр
596	МІН-42	4	70	бакалавр
597	МІН-М1	1	70	магістр
598	ПКП-11	1	74	бакалавр
599	ПКП-12	1	74	бакалавр
600	ПКП-21	2	74	бакалавр
601	ПКП-22	2	74	бакалавр
602	ПКП-31	3	74	бакалавр
603	ПКП-32	3	74	бакалавр
604	ПКП-41	4	74	бакалавр
605	ПКП-42	4	74	бакалавр
606	ПКП-М1	1	74	магістр
607	ПСП-11	1	75	бакалавр
608	ПСП-12	1	75	бакалавр
609	ПСП-21	2	75	бакалавр
610	ПСП-22	2	75	бакалавр
611	ПСП-31	3	75	бакалавр
612	ПСП-32	3	75	бакалавр
613	ПСП-41	4	75	бакалавр
614	ПСП-42	4	75	бакалавр
615	ПСП-М1	1	75	магістр
616	ППА-11	1	78	бакалавр
617	ППА-12	1	78	бакалавр
618	ППА-21	2	78	бакалавр
619	ППА-22	2	78	бакалавр
620	ППА-31	3	78	бакалавр
621	ППА-32	3	78	бакалавр
622	ППА-41	4	78	бакалавр
623	ППА-42	4	78	бакалавр
624	ППА-М1	1	78	магістр
625	ППІ-11	1	79	бакалавр
626	ППІ-12	1	79	бакалавр
627	ППІ-21	2	79	бакалавр
628	ППІ-22	2	79	бакалавр
629	ППІ-31	3	79	бакалавр
630	ППІ-32	3	79	бакалавр
631	ППІ-41	4	79	бакалавр
632	ППІ-42	4	79	бакалавр
633	ППІ-М1	1	79	магістр
634	ПФК-11	1	80	бакалавр
635	ПФК-12	1	80	бакалавр
636	ПФК-21	2	80	бакалавр
637	ПФК-22	2	80	бакалавр
638	ПФК-31	3	80	бакалавр
639	ПФК-32	3	80	бакалавр
640	ПФК-41	4	80	бакалавр
641	ПФК-42	4	80	бакалавр
642	ПФК-М1	1	80	магістр
643	ППМ-11	1	82	бакалавр
644	ППМ-12	1	82	бакалавр
645	ППМ-21	2	82	бакалавр
646	ППМ-22	2	82	бакалавр
647	ППМ-31	3	82	бакалавр
648	ППМ-32	3	82	бакалавр
649	ППМ-41	4	82	бакалавр
650	ППМ-42	4	82	бакалавр
651	ППМ-М1	1	82	магістр
652	ПСА-11	1	84	бакалавр
653	ПСА-12	1	84	бакалавр
654	ПСА-21	2	84	бакалавр
655	ПСА-22	2	84	бакалавр
656	ПСА-31	3	84	бакалавр
657	ПСА-32	3	84	бакалавр
658	ПСА-41	4	84	бакалавр
659	ПСА-42	4	84	бакалавр
660	ПСА-М1	1	84	магістр
661	УЦЕ-11	1	86	бакалавр
662	УЦЕ-12	1	86	бакалавр
663	УЦЕ-21	2	86	бакалавр
664	УЦЕ-22	2	86	бакалавр
665	УЦЕ-31	3	86	бакалавр
666	УЦЕ-32	3	86	бакалавр
667	УЦЕ-41	4	86	бакалавр
668	УЦЕ-42	4	86	бакалавр
669	УЦЕ-М1	1	86	магістр
670	УОА-11	1	87	бакалавр
671	УОА-12	1	87	бакалавр
672	УОА-21	2	87	бакалавр
673	УОА-22	2	87	бакалавр
674	УОА-31	3	87	бакалавр
675	УОА-32	3	87	бакалавр
676	УОА-41	4	87	бакалавр
677	УОА-42	4	87	бакалавр
678	УОА-М1	1	87	магістр
679	УФМ-11	1	88	бакалавр
680	УФМ-12	1	88	бакалавр
681	УФМ-21	2	88	бакалавр
682	УФМ-22	2	88	бакалавр
683	УФМ-31	3	88	бакалавр
684	УФМ-32	3	88	бакалавр
685	УФМ-41	4	88	бакалавр
686	УФМ-42	4	88	бакалавр
687	УФМ-М1	1	88	магістр
688	УПА-11	1	89	бакалавр
689	УПА-12	1	89	бакалавр
690	УПА-21	2	89	бакалавр
691	УПА-22	2	89	бакалавр
692	УПА-31	3	89	бакалавр
693	УПА-32	3	89	бакалавр
694	УПА-41	4	89	бакалавр
695	УПА-42	4	89	бакалавр
696	УПА-М1	1	89	магістр
697	УПУ-11	1	90	бакалавр
698	УПУ-12	1	90	бакалавр
699	УПУ-21	2	90	бакалавр
700	УПУ-22	2	90	бакалавр
701	УПУ-31	3	90	бакалавр
702	УПУ-32	3	90	бакалавр
703	УПУ-41	4	90	бакалавр
704	УПУ-42	4	90	бакалавр
705	УПУ-М1	1	90	магістр
706	ФАК-11	1	91	бакалавр
707	ФАК-12	1	91	бакалавр
708	ФАК-21	2	91	бакалавр
709	ФАК-22	2	91	бакалавр
710	ФАК-31	3	91	бакалавр
711	ФАК-32	3	91	бакалавр
712	ФАК-41	4	91	бакалавр
713	ФАК-42	4	91	бакалавр
714	ФАК-М1	1	91	магістр
715	ФЕТ-11	1	92	бакалавр
716	ФЕТ-12	1	92	бакалавр
717	ФЕТ-21	2	92	бакалавр
718	ФЕТ-22	2	92	бакалавр
719	ФЕТ-31	3	92	бакалавр
720	ФЕТ-32	3	92	бакалавр
721	ФЕТ-41	4	92	бакалавр
722	ФЕТ-42	4	92	бакалавр
723	ФЕТ-М1	1	92	магістр
724	ФКК-11	1	93	бакалавр
725	ФКК-12	1	93	бакалавр
726	ФКК-21	2	93	бакалавр
727	ФКК-22	2	93	бакалавр
728	ФКК-31	3	93	бакалавр
729	ФКК-32	3	93	бакалавр
730	ФКК-41	4	93	бакалавр
731	ФКК-42	4	93	бакалавр
732	ФКК-М1	1	93	магістр
733	ФФМ-11	1	94	бакалавр
734	ФФМ-12	1	94	бакалавр
735	ФФМ-21	2	94	бакалавр
736	ФФМ-22	2	94	бакалавр
737	ФФМ-31	3	94	бакалавр
738	ФФМ-32	3	94	бакалавр
739	ФФМ-41	4	94	бакалавр
740	ФФМ-42	4	94	бакалавр
741	ФФМ-М1	1	94	магістр
742	ФЦТ-11	1	95	бакалавр
743	ФЦТ-12	1	95	бакалавр
744	ФЦТ-21	2	95	бакалавр
745	ФЦТ-22	2	95	бакалавр
746	ФЦТ-31	3	95	бакалавр
747	ФЦТ-32	3	95	бакалавр
748	ФЦТ-41	4	95	бакалавр
749	ФЦТ-42	4	95	бакалавр
750	ФЦТ-М1	1	95	магістр
751	ФСО-11	1	96	бакалавр
752	ФСО-12	1	96	бакалавр
753	ФСО-21	2	96	бакалавр
754	ФСО-22	2	96	бакалавр
755	ФСО-31	3	96	бакалавр
756	ФСО-32	3	96	бакалавр
757	ФСО-41	4	96	бакалавр
758	ФСО-42	4	96	бакалавр
759	ФСО-М1	1	96	магістр
760	ФЛТ-11	1	97	бакалавр
761	ФЛТ-12	1	97	бакалавр
762	ФЛТ-21	2	97	бакалавр
763	ФЛТ-22	2	97	бакалавр
764	ФЛТ-31	3	97	бакалавр
765	ФЛТ-32	3	97	бакалавр
766	ФЛТ-41	4	97	бакалавр
767	ФЛТ-42	4	97	бакалавр
768	ФЛТ-М1	1	97	магістр
769	ФУМ-11	1	98	бакалавр
770	ФУМ-12	1	98	бакалавр
771	ФУМ-21	2	98	бакалавр
772	ФУМ-22	2	98	бакалавр
773	ФУМ-31	3	98	бакалавр
774	ФУМ-32	3	98	бакалавр
775	ФУМ-41	4	98	бакалавр
776	ФУМ-42	4	98	бакалавр
777	ФУМ-М1	1	98	магістр
778	ФУІ-11	1	99	бакалавр
779	ФУІ-12	1	99	бакалавр
780	ФУІ-21	2	99	бакалавр
781	ФУІ-22	2	99	бакалавр
782	ФУІ-31	3	99	бакалавр
783	ФУІ-32	3	99	бакалавр
784	ФУІ-41	4	99	бакалавр
785	ФУІ-42	4	99	бакалавр
786	ФУІ-М1	1	99	магістр
787	ФПЛ-11	1	100	бакалавр
788	ФПЛ-12	1	100	бакалавр
789	ФПЛ-21	2	100	бакалавр
790	ФПЛ-22	2	100	бакалавр
791	ФПЛ-31	3	100	бакалавр
792	ФПЛ-32	3	100	бакалавр
793	ФПЛ-41	4	100	бакалавр
794	ФПЛ-42	4	100	бакалавр
795	ФПЛ-М1	1	100	магістр
796	ФСБ-11	1	101	бакалавр
797	ФСБ-12	1	101	бакалавр
798	ФСБ-21	2	101	бакалавр
799	ФСБ-22	2	101	бакалавр
800	ФСБ-31	3	101	бакалавр
801	ФСБ-32	3	101	бакалавр
802	ФСБ-41	4	101	бакалавр
803	ФСБ-42	4	101	бакалавр
804	ФСБ-М1	1	101	магістр
805	ФСК-11	1	102	бакалавр
806	ФСК-12	1	102	бакалавр
807	ФСК-21	2	102	бакалавр
808	ФСК-22	2	102	бакалавр
809	ФСК-31	3	102	бакалавр
810	ФСК-32	3	102	бакалавр
811	ФСК-41	4	102	бакалавр
812	ФСК-42	4	102	бакалавр
813	ФСК-М1	1	102	магістр
814	ФЧШ-11	1	103	бакалавр
815	ФЧШ-12	1	103	бакалавр
816	ФЧШ-21	2	103	бакалавр
817	ФЧШ-22	2	103	бакалавр
818	ФЧШ-31	3	103	бакалавр
819	ФЧШ-32	3	103	бакалавр
820	ФЧШ-41	4	103	бакалавр
821	ФЧШ-42	4	103	бакалавр
822	ФЧШ-М1	1	103	магістр
823	ФСЛ-11	1	104	бакалавр
824	ФСЛ-12	1	104	бакалавр
825	ФСЛ-21	2	104	бакалавр
826	ФСЛ-22	2	104	бакалавр
827	ФСЛ-31	3	104	бакалавр
828	ФСЛ-32	3	104	бакалавр
829	ФСЛ-41	4	104	бакалавр
830	ФСЛ-42	4	104	бакалавр
831	ФСЛ-М1	1	104	магістр
832	ФАР-11	1	105	бакалавр
833	ФАР-12	1	105	бакалавр
834	ФАР-21	2	105	бакалавр
835	ФАР-22	2	105	бакалавр
836	ФАР-31	3	105	бакалавр
837	ФАР-32	3	105	бакалавр
838	ФАР-41	4	105	бакалавр
839	ФАР-42	4	105	бакалавр
840	ФАР-М1	1	105	магістр
841	ФКИТ-11	1	106	бакалавр
842	ФКИТ-12	1	106	бакалавр
843	ФКИТ-21	2	106	бакалавр
844	ФКИТ-22	2	106	бакалавр
845	ФКИТ-31	3	106	бакалавр
846	ФКИТ-32	3	106	бакалавр
847	ФКИТ-41	4	106	бакалавр
848	ФКИТ-42	4	106	бакалавр
849	ФКИТ-М1	1	106	магістр
850	ФТУ-11	1	107	бакалавр
851	ФТУ-12	1	107	бакалавр
852	ФТУ-21	2	107	бакалавр
853	ФТУ-22	2	107	бакалавр
854	ФТУ-31	3	107	бакалавр
855	ФТУ-32	3	107	бакалавр
856	ФТУ-41	4	107	бакалавр
857	ФТУ-42	4	107	бакалавр
858	ФТУ-М1	1	107	магістр
859	ФПЕР-11	1	108	бакалавр
860	ФПЕР-12	1	108	бакалавр
861	ФПЕР-21	2	108	бакалавр
862	ФПЕР-22	2	108	бакалавр
863	ФПЕР-31	3	108	бакалавр
864	ФПЕР-32	3	108	бакалавр
865	ФПЕР-41	4	108	бакалавр
866	ФПЕР-42	4	108	бакалавр
867	ФПЕР-М1	1	108	магістр
868	ФЯП-11	1	109	бакалавр
869	ФЯП-12	1	109	бакалавр
870	ФЯП-21	2	109	бакалавр
871	ФЯП-22	2	109	бакалавр
872	ФЯП-31	3	109	бакалавр
873	ФЯП-32	3	109	бакалавр
874	ФЯП-41	4	109	бакалавр
875	ФЯП-42	4	109	бакалавр
876	ФЯП-М1	1	109	магістр
877	ФФЛ-11	1	110	бакалавр
878	ФФЛ-12	1	110	бакалавр
879	ФФЛ-21	2	110	бакалавр
880	ФФЛ-22	2	110	бакалавр
881	ФФЛ-31	3	110	бакалавр
882	ФФЛ-32	3	110	бакалавр
883	ФФЛ-41	4	110	бакалавр
884	ФФЛ-42	4	110	бакалавр
885	ФФЛ-М1	1	110	магістр
886	ФПЛІ-11	1	111	бакалавр
887	ФПЛІ-12	1	111	бакалавр
888	ФПЛІ-21	2	111	бакалавр
889	ФПЛІ-22	2	111	бакалавр
890	ФПЛІ-31	3	111	бакалавр
891	ФПЛІ-32	3	111	бакалавр
892	ФПЛІ-41	4	111	бакалавр
893	ФПЛІ-42	4	111	бакалавр
894	ФПЛІ-М1	1	111	магістр
895	ФЛФ-11	1	112	бакалавр
896	ФЛФ-12	1	112	бакалавр
897	ФЛФ-21	2	112	бакалавр
898	ФЛФ-22	2	112	бакалавр
899	ФЛФ-31	3	112	бакалавр
900	ФЛФ-32	3	112	бакалавр
901	ФЛФ-41	4	112	бакалавр
902	ФЛФ-42	4	112	бакалавр
903	ФЛФ-М1	1	112	магістр
904	ФКУ-11	1	113	бакалавр
905	ФКУ-12	1	113	бакалавр
906	ФКУ-21	2	113	бакалавр
907	ФКУ-22	2	113	бакалавр
908	ФКУ-31	3	113	бакалавр
909	ФКУ-32	3	113	бакалавр
910	ФКУ-41	4	113	бакалавр
911	ФКУ-42	4	113	бакалавр
912	ФКУ-М1	1	113	магістр
913	ФПО-11	1	114	бакалавр
914	ФПО-12	1	114	бакалавр
915	ФПО-21	2	114	бакалавр
916	ФПО-22	2	114	бакалавр
917	ФПО-31	3	114	бакалавр
918	ФПО-32	3	114	бакалавр
919	ФПО-41	4	114	бакалавр
920	ФПО-42	4	114	бакалавр
921	ФПО-М1	1	114	магістр
922	ФПС-11	1	115	бакалавр
923	ФПС-12	1	115	бакалавр
924	ФПС-21	2	115	бакалавр
925	ФПС-22	2	115	бакалавр
926	ФПС-31	3	115	бакалавр
927	ФПС-32	3	115	бакалавр
928	ФПС-41	4	115	бакалавр
929	ФПС-42	4	115	бакалавр
930	ФПС-М1	1	115	магістр
931	ХХМ-11	1	116	бакалавр
932	ХХМ-12	1	116	бакалавр
933	ХХМ-21	2	116	бакалавр
934	ХХМ-22	2	116	бакалавр
935	ХХМ-31	3	116	бакалавр
936	ХХМ-32	3	116	бакалавр
937	ХХМ-41	4	116	бакалавр
938	ХХМ-42	4	116	бакалавр
939	ХХМ-М1	1	116	магістр
940	ЮПР-11	1	117	бакалавр
941	ЮПР-12	1	117	бакалавр
942	ЮПР-21	2	117	бакалавр
943	ЮПР-22	2	117	бакалавр
944	ЮПР-31	3	117	бакалавр
945	ЮПР-32	3	117	бакалавр
946	ЮПР-41	4	117	бакалавр
947	ЮПР-42	4	117	бакалавр
948	ЮПР-М1	1	117	магістр
\.


--
-- Data for Name: message_read_receipts; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.message_read_receipts (id, message_id, user_id, read_at) FROM stdin;
1	\N	21	2025-10-15 22:06:52.504007
2	\N	21	2025-10-15 22:06:52.526347
5	\N	21	2025-10-15 22:10:58.962085
6	\N	21	2025-10-15 22:10:58.992741
17	\N	21	2025-10-16 21:22:00.069804
18	\N	21	2025-10-16 21:22:00.088291
19	\N	21	2025-10-16 21:22:15.101713
20	\N	21	2025-10-16 21:22:15.123281
21	\N	21	2025-10-16 21:22:15.91281
22	\N	21	2025-10-16 21:22:15.933963
23	\N	21	2025-10-16 21:22:24.430149
24	\N	21	2025-10-16 21:22:24.443731
25	\N	21	2025-10-16 21:22:26.634952
26	\N	21	2025-10-16 21:22:26.654781
27	\N	21	2025-10-16 21:22:28.531765
28	\N	21	2025-10-16 21:22:28.549248
29	\N	21	2025-10-16 22:01:36.061328
30	\N	21	2025-10-16 22:01:36.082457
33	\N	21	2025-10-16 22:01:51.708169
34	\N	21	2025-10-16 22:01:52.219633
35	\N	21	2025-10-16 22:01:52.239504
40	\N	21	2025-10-16 22:04:05.749465
41	\N	21	2025-10-16 22:04:05.770222
42	\N	21	2025-10-16 22:04:06.526958
43	\N	21	2025-10-16 22:04:07.249176
44	\N	21	2025-10-16 22:04:07.264429
45	\N	21	2025-10-16 22:04:39.812176
46	\N	21	2025-10-16 22:04:40.362987
47	\N	21	2025-10-16 22:04:40.390514
48	\N	21	2025-10-16 22:04:41.226653
49	\N	21	2025-10-16 22:04:41.252084
54	\N	21	2025-10-16 22:23:41.242672
55	\N	21	2025-10-16 22:23:41.276093
58	\N	21	2025-10-16 22:24:11.141514
59	\N	21	2025-10-16 22:24:11.16697
62	\N	21	2025-10-16 22:24:53.366905
63	\N	21	2025-10-16 22:24:53.390546
64	\N	21	2025-10-16 22:24:56.204062
65	\N	21	2025-10-16 22:24:56.854922
66	\N	21	2025-10-16 22:24:56.875905
67	\N	21	2025-10-16 22:25:01.220763
68	\N	21	2025-10-16 22:25:02.189333
69	\N	21	2025-10-16 22:25:02.207052
70	\N	21	2025-10-16 23:03:33.304222
71	\N	21	2025-10-16 23:03:33.351623
72	\N	21	2025-10-16 23:03:37.667423
73	\N	21	2025-10-16 23:03:38.533348
74	\N	21	2025-10-16 23:03:38.549658
77	\N	21	2025-10-16 23:04:01.358498
78	\N	21	2025-10-16 23:04:01.37523
79	\N	21	2025-10-16 23:04:02.652529
80	\N	21	2025-10-16 23:04:02.677289
81	\N	21	2025-10-16 23:04:03.30055
82	\N	21	2025-10-16 23:04:03.321421
85	\N	21	2025-10-16 23:04:55.318741
86	\N	21	2025-10-16 23:05:09.298987
87	\N	21	2025-10-16 23:05:09.314737
92	\N	21	2025-10-18 23:41:59.635692
93	\N	21	2025-10-18 23:41:59.660727
94	\N	22	2025-10-18 23:43:45.561374
95	\N	22	2025-10-18 23:43:45.588799
96	\N	22	2025-10-18 23:44:03.384898
97	\N	22	2025-10-18 23:44:03.405113
98	\N	21	2025-10-18 23:44:06.762944
99	\N	21	2025-10-18 23:44:06.787581
100	\N	21	2025-10-18 23:44:13.146419
101	\N	21	2025-10-18 23:44:13.929441
102	\N	21	2025-10-18 23:44:13.952895
103	\N	21	2025-10-18 23:44:17.821958
104	\N	21	2025-10-18 23:44:18.727203
105	\N	21	2025-10-18 23:44:18.745287
106	\N	21	2025-10-19 00:02:37.85741
107	\N	21	2025-10-19 00:02:37.898443
108	\N	21	2025-10-19 00:02:38.853413
109	\N	21	2025-10-19 00:02:38.87804
110	\N	21	2025-10-19 00:02:55.155495
111	\N	21	2025-10-19 00:02:55.171735
118	\N	21	2025-10-19 15:39:17.973055
119	\N	21	2025-10-19 15:39:18.013872
120	\N	21	2025-10-19 15:39:22.911033
121	\N	21	2025-10-19 15:39:22.926728
122	\N	21	2025-10-19 15:39:23.993531
123	\N	21	2025-10-19 15:39:24.021448
124	\N	21	2025-10-19 15:39:24.730009
125	\N	21	2025-10-19 15:39:24.753511
126	\N	21	2025-10-19 15:39:28.828348
127	\N	21	2025-10-19 15:39:28.842985
128	\N	21	2025-10-19 15:39:32.244071
129	\N	21	2025-10-19 15:39:32.266971
130	\N	21	2025-10-19 15:39:41.929602
131	\N	21	2025-10-19 15:39:41.959791
132	\N	21	2025-10-19 15:39:51.831285
133	\N	21	2025-10-19 15:39:51.853807
134	\N	21	2025-10-19 15:39:53.749092
135	\N	21	2025-10-19 15:39:53.771444
136	\N	21	2025-10-19 15:39:56.934197
137	\N	21	2025-10-19 15:39:56.946167
138	\N	21	2025-10-19 15:45:29.149028
139	\N	21	2025-10-19 15:45:29.182212
140	\N	21	2025-10-19 15:45:37.1083
141	\N	21	2025-10-19 15:45:37.125188
142	\N	21	2025-10-19 15:45:52.584027
143	\N	21	2025-10-19 15:45:52.600964
144	\N	21	2025-10-19 15:45:54.480987
145	\N	21	2025-10-19 15:45:54.498257
146	\N	21	2025-10-19 15:46:39.449323
147	\N	21	2025-10-19 15:46:39.471784
148	\N	21	2025-10-19 15:49:57.80766
149	\N	21	2025-10-19 15:49:57.835876
150	\N	21	2025-10-19 15:50:06.557089
151	\N	21	2025-10-19 15:50:06.569833
152	\N	21	2025-10-19 15:50:24.130914
153	\N	21	2025-10-19 15:50:24.155776
154	\N	21	2025-10-19 16:40:47.076057
155	\N	21	2025-10-19 16:40:47.116956
156	\N	21	2025-10-19 16:40:49.873416
157	\N	21	2025-10-19 16:40:49.899629
158	\N	21	2025-10-19 16:40:58.307421
159	\N	21	2025-10-19 16:40:58.320523
160	\N	21	2025-10-19 16:40:58.915957
161	\N	21	2025-10-19 16:40:58.936519
162	\N	21	2025-10-19 16:41:04.405515
163	\N	21	2025-10-19 16:41:04.422272
164	\N	21	2025-10-19 16:41:05.611706
165	\N	21	2025-10-19 16:41:05.623163
166	\N	21	2025-10-19 16:41:07.616882
167	\N	21	2025-10-19 16:41:07.630713
168	\N	21	2025-10-25 14:09:44.543704
169	\N	21	2025-10-25 14:09:44.638521
170	\N	21	2025-10-25 14:11:14.287252
171	\N	21	2025-10-25 14:11:14.303955
172	\N	21	2025-10-25 14:11:15.353874
173	\N	21	2025-10-25 14:11:15.367074
174	\N	21	2025-10-25 14:11:16.078103
175	\N	21	2025-10-25 14:11:16.09417
176	\N	21	2025-10-25 14:11:16.661019
177	\N	21	2025-10-25 14:11:16.674518
178	\N	21	2025-10-25 14:11:17.30799
179	\N	21	2025-10-25 14:11:17.32132
180	\N	21	2025-10-25 14:11:18.505883
181	\N	21	2025-10-25 14:11:18.528744
182	\N	21	2025-10-25 14:11:20.174712
183	\N	21	2025-10-25 14:11:20.186588
184	\N	21	2025-10-25 14:11:20.856543
185	\N	21	2025-10-25 14:11:20.866697
186	\N	21	2025-10-25 15:10:16.10503
187	\N	21	2025-10-25 15:10:16.141728
188	\N	21	2025-10-25 15:10:16.980596
189	\N	21	2025-10-25 15:10:16.992863
190	\N	21	2025-10-25 15:10:17.722888
191	\N	21	2025-10-25 15:10:17.738447
192	\N	21	2025-10-25 15:10:25.815997
193	\N	21	2025-10-25 15:10:25.846142
194	\N	21	2025-10-25 15:10:38.482718
195	\N	21	2025-10-25 15:10:38.511221
196	\N	21	2025-10-25 15:10:43.060488
197	\N	21	2025-10-25 15:10:43.076861
198	\N	21	2025-10-25 15:10:52.41123
199	\N	21	2025-10-25 15:10:52.428178
200	\N	21	2025-10-25 15:12:54.973268
201	\N	21	2025-10-25 15:12:54.983962
202	\N	21	2025-10-25 15:12:55.444709
203	\N	21	2025-10-25 15:12:55.463325
204	\N	21	2025-10-25 15:12:57.279374
205	\N	21	2025-10-25 15:12:57.292845
206	\N	21	2025-10-25 15:12:58.020838
207	\N	21	2025-10-25 15:12:58.038581
208	\N	21	2025-10-25 15:12:58.588593
209	\N	21	2025-10-25 15:12:58.602001
210	\N	21	2025-10-25 15:12:59.250501
211	\N	21	2025-10-25 15:12:59.263943
212	\N	21	2025-10-25 15:13:00.073614
213	\N	21	2025-10-25 15:13:00.095738
214	\N	21	2025-10-25 15:13:00.886358
215	\N	21	2025-10-25 15:13:00.90262
216	\N	21	2025-10-25 15:13:01.542217
217	\N	21	2025-10-25 15:13:01.566705
218	\N	21	2025-10-25 15:13:02.097071
219	\N	21	2025-10-25 15:13:02.111567
220	\N	21	2025-10-25 15:13:02.995377
221	\N	21	2025-10-25 15:13:03.012907
222	\N	21	2025-10-25 15:13:05.910338
223	\N	21	2025-10-25 15:13:05.936588
224	\N	21	2025-10-25 15:13:06.955199
225	\N	21	2025-10-25 15:13:06.970923
226	\N	21	2025-10-25 15:13:25.991307
227	\N	21	2025-10-25 15:13:26.002465
228	\N	21	2025-10-25 15:13:26.682929
229	\N	21	2025-10-25 15:13:26.701915
230	\N	21	2025-10-25 15:13:38.707369
231	\N	21	2025-10-25 15:13:38.723375
232	\N	21	2025-10-25 15:13:39.607342
233	\N	21	2025-10-25 15:13:39.622163
234	\N	22	2025-10-27 21:59:34.57068
235	\N	22	2025-10-27 21:59:34.63557
236	\N	21	2025-11-01 14:19:23.148412
237	\N	21	2025-11-01 14:19:23.225289
238	\N	21	2025-11-01 14:19:26.608413
239	\N	21	2025-11-01 14:19:26.622641
240	\N	21	2025-11-01 14:19:29.640715
241	\N	21	2025-11-01 14:19:29.652583
242	\N	21	2025-11-01 14:19:33.018719
243	\N	21	2025-11-01 14:19:33.032574
244	\N	21	2025-11-01 14:19:36.090888
245	\N	21	2025-11-01 14:19:36.108863
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.messages (id, sender, name, content, "timestamp", student_email, receiver_email, attachment) FROM stdin;
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.notes (id, user_id, title, content, tags, category, is_bookmarked, is_public, background_color, text_color, images, word_count, created_at, updated_at, display_order) FROM stdin;
2	1396	иииииии	иииииииии	{}	personal	f	f	#ffffff	#000000	{}	1	2025-11-16 00:38:08.903415+02	2025-11-16 00:38:08.903415+02	0
1	1396	ccccccqqqqqqq5455	яолмтвялотмиоялмтвяіломтаолпмтяломтивяолмптявлпаолячвиорпм чяиловатілоамипвормптоавтавоатвоттоhhhhhиииииииирррт иівирпbhghbbnnnnпоиhт	{}	personal	f	f	#ffcc99	#000000	{}	3	2025-11-16 00:37:18.213664+02	2025-11-16 12:23:33.750133+02	0
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.notifications (id, user_id, type, title, message, related_entity, related_entity_id, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.resources (id, title, description, link, category, created_by, created_at, updated_at, click_count) FROM stdin;
4	cvvcc	xxxxx	ddfre	guidelines	22	2025-09-01 23:29:00.141407+03	2025-09-01 23:29:00.141407+03	0
5	fjgnk n	kgmkfmle	kfgmngkkr	guidelines	22	2025-09-03 17:02:49.837877+03	2025-09-03 17:02:49.837877+03	0
6	off,mmdd	flfkmlrepfmdle	https://example.com	literature	22	2025-09-04 12:27:05.94505+03	2025-09-04 12:27:05.94505+03	0
7	ааа	мммм	https://мммм	templates	22	2025-09-04 18:09:58.015288+03	2025-09-04 18:09:58.015288+03	0
8	hjk	mmm	https://gtrfgg	templates	22	2025-09-04 18:46:59.677535+03	2025-09-04 18:46:59.677535+03	0
\.


--
-- Data for Name: specialties; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.specialties (id, code, name, faculty_id) FROM stdin;
1	A4.05	Середня освіта (Біологія та здоровя людини)	1
2	A4.15	Середня освіта (Природничі науки)	1
3	E1	Біологія та біохімія	1
4	E2	Екологія	1
5	G21	Біотехнології та біоінженерія	1
6	A4.07	Середня освіта (Географія)	2
7	C6	Географія та регіональні студії	2
8	C6	Урбаністика, просторове планування і регіональний розвиток	2
9	E4	Ґрунтознавство та експертна оцінка земель	2
10	E4	Рельєф і геопланування	2
11	G13	Харчові технології	2
12	G2	Геоінформаційні технології захисту навколишнього середовища	2
13	J2	Готельно-ресторанна справа	2
14	J3	Рекреаційна діяльність	2
15	J3	Туристична діяльність	2
16	E4	Геологія. Цифрові технології в науках про Землю	3
17	E4	Інженерна геологія та гідрогеологія	3
18	E4	Надрокористування	3
19	C1	Економіка і захист ділових інтересів	4
20	C1	Економіка та аналітика даних	4
21	C1	Економічна кібернетика	4
22	C1	Міжнародна економіка	4
23	D1	Діджитал облік, бізнес-консалтинг і аудит	4
24	D1	Облік, аналіз і оподаткування в бізнесі	4
25	D2	Фінанси, банківська справа, страхування та фондовий ринок	4
26	D3	Менеджмент організацій і адміністрування	4
27	D3	Управління бізнесом та підприємництво	4
28	D3	Цифрове управління в бізнесі	4
29	D5	Маркетинг	4
30	D7	Логістика та торговельний бізнес	4
31	I10	Соціальне забезпечення	4
32	С1/D5	Бізнес-економіка (міждисциплінарна)	4
33	A4.03	Середня освіта (Історія та громадянська освіта)	8
34	B12	Організація музейного простору. Ексурсознавство	8
35	B9	Історія та археологія	8
36	C5	Прикладна соціологія	8
37	A4.04	Середня освіта (Математика)	10
38	E7	Актуарна математика та керування ризиками	10
39	E7	Аналіз математичних моделей	10
40	E7	Економетрика та дослідження операцій	10
41	E7	Прикладна алгебра, криптологія та теорія ігор	10
42	E8	Статистичний аналіз даних	10
43	F1	Інформаційні технології та математичне моделювання в механіці	10
44	F2	Інженерія програмного забезпечення	5
45	F3	Комп'ютерні науки	5
46	F6	Інформаційні системи та технології	5
47	G5	Електроніка та комп'ютерні системи	5
48	G7	Сенсорні та діагностичні електронні системи	5
49	C7	Журналістика	6
50	C7	Міжнародна журналістика	6
51	B11.041	Англійська та друга іноземні мови і літератури	7
52	B11.041	Переклад (англійська та друга іноземні мови)	7
53	B11.043	Німецька та англійська мови і літератури (переклад включно)	7
54	B11.043	Переклад (німецька і друга іноземна мови, міжкультурна комунікація)	7
55	B11.051	Іспанська та друга іноземні мови і літератури	7
56	B11.055	Французька та англійська мови і літератури	7
57	B11.08	Класична філологія і англійська мова	7
58	A4.13	Середня освіта (Музичне мистецтво)	9
59	B1	Продюсерство аудіовізуального мистецтва та медіавиробництва	9
60	B13	Інформаційна діяльність, бібліотечна та архівна справа	9
61	B5	Хорове диригування	9
62	B6	Акторське мистецтво драматичного театру та кіно	9
63	B6	Акторське мистецтво театру ляльок	9
64	B6	Театрознавство	9
65	B6	Хореографія	9
66	C1	Міжнародна комерція та підприємництво	11
67	C1	Міжнародні економічні відносини	11
68	C3	Європеїстика	11
69	C3	Міжнародна безпека та антикризове врегулювання	11
70	C3	Міжнародна інформація	11
71	C3	Міжнародні відносини	11
72	D9	Міжнародне право	11
73	A6.01	Логопедія	12
74	A6.02	Корекційна психопедагогіка	12
75	I10	Соціальна педагогіка	12
76	А2	Дошкільна освіта	12
77	А3	Початкова освіта	12
78	А3	Початкова освіта. Англійська мова у початковій школі	12
79	А3	Початкова освіта. Інформатика у початковій школі	12
80	A4.11	Середня освіта (Фізична культура)	12
81	A4.09	Середня освіта (Інформатика)	13
82	F1	Прикладна математика	13
83	F3	Інформатика	13
84	F4	Системний аналіз і управління. Інтелектуальний аналіз даних	13
85	F5	Кібербезпека	13
86	C1	Цифрова економіка	14
87	D1	Облік, аудиторська діяльність та оподаткування в бізнесі	14
88	D2	Фінанси, митна та податкова справа	14
89	D4	Публічне адміністрування та управління бізнесом	14
90	D4	Публічне управління та адміністрування. Управління персоналом в органах публічної влади та бізнес-структурах	14
91	E5	Астрофізика та фізика космосу	15
92	E5	Експериментальна та теоретична фізика	15
93	E5	Квантові комп'ютери та квантове програмування	15
94	E5	Фізика та моделювання	15
95	E6	Цифрові технології в прикладній фізиці. Нанофізика та наноматеріали	15
96	A4.01	Середня освіта (Українська мова і література)	16
97	B11.01	Літературна творчість	16
98	B11.01	Українська мова та література	16
99	B11.01	Українська мова та література, українська мова як іноземна	16
100	B11.033	Польська мова та література	16
101	B11.035	Сербська мова та література	16
102	B11.036	Словацька мова та література	16
103	B11.038	Чеська мова та література	16
104	B11.039	Словенська мова та література	16
105	B11.060	Арабська мова та література, українська мова та література	16
106	B11.065	Китайська мова і література. Українська мова. Технології перекладу й редагування	16
107	B11.067	Турецька мова та література, українська мова та література	16
108	B11.068	Перська мова і література. Українська мова. Технології перекладу та редагування	16
109	B11.069	Японська мова та література, українська мова та література	16
110	B11.09	Фольклористика	16
111	B11.10	Прикладна лінгвістика	16
112	B10	Філософія	17
113	B12	Культурологія	17
114	C2	Політологія	17
115	C4	Психологія	17
116	E3	Хімія	18
117	D8	Право	19
\.


--
-- Data for Name: student_achievements; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_achievements (id, user_id, title, description, date, type, organization, certificate_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_activity_sessions; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_activity_sessions (id, user_id, start_time, end_time, duration, activity_type, chapters_worked, focus_score, time_of_day, created_at) FROM stdin;
1	21	2025-11-16 17:48:01.899857+02	\N	\N	analytics	{}	\N	evening	2025-11-16 17:48:01.899857+02
2	21	2025-11-16 17:48:10.843569+02	\N	\N	analytics	{}	\N	evening	2025-11-16 17:48:10.843569+02
3	21	2025-11-16 18:20:22.199959+02	\N	\N	analytics	{}	\N	evening	2025-11-16 18:20:22.199959+02
4	21	2025-11-16 18:31:45.113109+02	\N	\N	analytics	{}	\N	evening	2025-11-16 18:31:45.113109+02
5	21	2025-11-16 19:52:27.984218+02	\N	\N	analytics	{}	\N	evening	2025-11-16 19:52:27.984218+02
6	21	2025-11-16 19:52:29.063095+02	\N	\N	analytics	{}	\N	evening	2025-11-16 19:52:29.063095+02
7	21	2025-11-16 19:52:45.133704+02	\N	\N	analytics	{}	\N	evening	2025-11-16 19:52:45.133704+02
8	21	2025-11-16 23:41:33.36484+02	\N	\N	analytics	{}	\N	night	2025-11-16 23:41:33.36484+02
9	283	2025-11-17 01:15:02.048781+02	\N	\N	analytics	{}	\N	night	2025-11-17 01:15:02.048781+02
10	21	2025-11-18 17:13:17.992156+02	\N	\N	analytics	{}	\N	evening	2025-11-18 17:13:17.992156+02
11	21	2025-11-18 17:13:20.563956+02	\N	\N	analytics	{}	\N	evening	2025-11-18 17:13:20.563956+02
12	21	2025-11-18 17:14:01.607279+02	\N	\N	analytics	{}	\N	evening	2025-11-18 17:14:01.607279+02
13	1378	2025-12-06 23:18:32.803458+02	\N	\N	analytics	{}	\N	night	2025-12-06 23:18:32.803458+02
14	1378	2025-12-06 23:18:35.085627+02	\N	\N	analytics	{}	\N	night	2025-12-06 23:18:35.085627+02
15	1378	2025-12-06 23:18:36.984954+02	\N	\N	analytics	{}	\N	night	2025-12-06 23:18:36.984954+02
16	1378	2025-12-06 23:18:40.694339+02	\N	\N	analytics	{}	\N	night	2025-12-06 23:18:40.694339+02
17	582	2025-12-06 23:19:08.496987+02	\N	\N	analytics	{}	\N	night	2025-12-06 23:19:08.496987+02
18	1428	2025-12-28 13:07:12.181597+02	\N	\N	analytics	{}	\N	afternoon	2025-12-28 13:07:12.181597+02
\.


--
-- Data for Name: student_applications; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_applications (id, topic, description, goals, requirements, teacher_id, deadline, student_id, student_name, student_email, student_phone, student_program, student_year, status, application_date, processed_at, processed_by, rejection_reason, created_at, updated_at, student_group, work_type, type, student_specialty_id, student_specialty_code, student_faculty_id, student_id_number) FROM stdin;
1	Методологія оцінки якості розробка навчального процесу	вввв	вввв	имсссс	580	2026-02-08	23	Поточний студент	viiktoria.osoba29@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	pending	2025-11-05 19:40:53.119671+02	\N	\N	\N	2025-11-05 19:40:53.119671+02	2025-11-05 19:40:53.119671+02	\N	coursework	course	\N	\N	\N	\N
2	Алгоритми покращення ефективності для освіти	eeee	fghyytggfg	fgdgdsfd	1385	2027-01-03	1385	Поточний студент	kushnir.oleksii@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	pending	2025-11-05 19:49:47.189141+02	\N	\N	\N	2025-11-05 19:49:47.189141+02	2025-11-05 19:49:47.189141+02	\N	coursework	course	\N	\N	\N	\N
3	Алгоритми покращення ефективності для освіти	nnn	mmmmm	kkkkk	1385	2026-02-05	1385	Поточний студент	kushnir.oleksii@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	pending	2025-11-05 19:50:31.413952+02	\N	\N	\N	2025-11-05 19:50:31.413952+02	2025-11-05 19:50:31.413952+02	\N	coursework	course	\N	\N	\N	\N
7	Інтеграція веб-технології в існуючу інфраструктуру освітніх технологій	ddd	dddd	dddddd	116	2026-02-05	116	Поточний студент	yuzevych.volodymyr@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	pending	2025-11-05 20:27:19.89654+02	\N	\N	\N	2025-11-05 20:27:19.89654+02	2025-11-05 20:27:19.89654+02	\N	coursework	course	\N	\N	\N	\N
12	AI-система для Мене цікавить розробка веб-додатку для управління студентськими проєктами в команді	vvvv	vvvvv	ccccc	\N	2026-02-05	1396	Поточний студент	rylskiy.olen@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	pending	2025-11-05 21:38:42.181055+02	\N	\N	\N	2025-11-05 21:38:42.181055+02	2025-11-05 21:38:42.181055+02	\N	coursework	course	\N	\N	\N	\N
13	Архітектура системи розробка студентів на основі веб-технології	dddddd	gggggg	eeee	108	2027-02-05	1396	Поточний студент	rylskiy.olen@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	pending	2025-11-05 21:40:32.205166+02	\N	\N	\N	2025-11-05 21:40:32.205166+02	2025-11-05 21:40:32.205166+02	\N	coursework	course	\N	\N	\N	\N
18	Технології обробки даних в системі розробка студентів	vvvvvv	fffffff	dddddddd	115	2027-02-05	23	Поточний студент	viiktoria.osoba29@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	pending	2025-11-05 22:44:14.878257+02	\N	\N	\N	2025-11-05 22:44:14.878257+02	2025-11-05 22:44:14.878257+02	\N	coursework	course	\N	\N	\N	\N
6	Інтеграція веб-технології в існуючу інфраструктуру освітніх технологій	ffff	vvvvvv	dddddd	116	2027-04-11	1396	Поточний студент	rylskiy.olen@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	rejected	2025-11-05 20:21:29.626991+02	2025-11-09 00:41:09.180163+02	116	cccc	2025-11-05 20:21:29.626991+02	2025-11-09 00:41:09.180163+02	\N	coursework	course	\N	\N	\N	\N
4	Інтеграція веб-технології в існуючу інфраструктуру освітніх технологій	fffff	ddddd	gggggg	116	2027-02-04	1396	Поточний студент	rylskiy.olen@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	rejected	2025-11-05 20:08:03.656926+02	2025-11-09 00:41:14.547394+02	116	\N	2025-11-05 20:08:03.656926+02	2025-11-09 00:41:14.547394+02	\N	coursework	course	\N	\N	\N	\N
11	Архітектура системи розробка студентів на основі веб-технології	ccccccc	vvvvvvv	vvvvvv	1378	2027-02-05	1378	Поточний студент	panchko.halyna@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	rejected	2025-11-05 21:22:26.710053+02	2025-11-09 00:51:11.182266+02	1378	ccccccc	2025-11-05 21:22:26.710053+02	2025-11-09 00:51:11.182266+02	\N	coursework	course	\N	\N	\N	\N
10	Аналіз потреб студенти в контексті освітніх технологій	ааааа	ааааа	ввввв	577	2026-02-08	577	Поточний студент	shuvar.roman@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	accepted	2025-11-05 21:13:07.804053+02	2025-11-09 01:51:59.383917+02	577	\N	2025-11-05 21:13:07.804053+02	2025-11-09 01:51:59.383917+02	\N	coursework	course	\N	\N	\N	\N
9	Аналіз потреб студенти в контексті освітніх технологій	cccc	fffff	hghhhh	577	2026-02-05	1396	Поточний студент	rylskiy.olen@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	rejected	2025-11-05 21:11:07.823557+02	2025-11-09 01:52:13.076362+02	577	Заявка відхилена викладачем	2025-11-05 21:11:07.823557+02	2025-11-09 01:52:13.076362+02	\N	coursework	course	\N	\N	\N	\N
5	Аналіз потреб студенти в контексті освітніх технологій	fffff	eeeee	ffffff	577	2026-02-05	577	Поточний студент	shuvar.roman@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	rejected	2025-11-05 20:15:24.43338+02	2025-11-09 01:52:16.139679+02	577	Заявка відхилена викладачем	2025-11-05 20:15:24.43338+02	2025-11-09 01:52:16.139679+02	\N	coursework	course	\N	\N	\N	\N
20	Дослідження ефективності розробка для навчального процесу	qwweerrrrrewww	wwwwwwwwwwwww	ddddddddddddwwqqqqq	580	2026-02-09	23	Студент	viiktoria.osoba29@lnu.edu.ua	\N	\N	\N	pending	2025-11-09 00:00:00+02	\N	\N	\N	2025-11-09 14:09:28.502287+02	2025-11-09 14:09:28.502287+02	\N	coursework	course	\N	\N	\N	\N
21	Технології обробки даних в системі розробка навчального процесу	ffffffkfkfkfskf	fkfkffkfkkkfkf	vvvmvmvmvmvmvm	115	2026-02-09	23	Студент	viiktoria.osoba29@lnu.edu.ua	\N	\N	\N	accepted	2025-11-09 00:00:00+02	2025-11-09 15:12:29.027219+02	115	\N	2025-11-09 15:03:12.589739+02	2025-11-09 15:12:29.027219+02	\N	coursework	course	\N	\N	\N	\N
19	Технології обробки даних в системі розробка студентів	fjfjffjfjfjfj	vvnvnvvnnvnv	dkdddkdkd	115	2027-02-05	23	Поточний студент	viiktoria.osoba29@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	rejected	2025-11-05 22:48:48.636912+02	2025-11-09 15:12:33.305307+02	115	Заявка відхилена викладачем	2025-11-05 22:48:48.636912+02	2025-11-09 15:12:33.305307+02	\N	coursework	course	\N	\N	\N	\N
15	Інтеграція сучасні технології в існуючу інфраструктуру освітніх технологій	fffff	ffffff	vvvvvv	114	2026-02-05	114	Поточний студент	hrabovskyi.volodymyr@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	accepted	2025-11-05 22:24:14.428885+02	2025-11-09 16:37:01.316173+02	114	\N	2025-11-05 22:24:14.428885+02	2025-11-09 16:37:01.316173+02	\N	coursework	course	\N	\N	\N	\N
14	Інтеграція сучасні технології в існуючу інфраструктуру освітніх технологій	nfnfnfnfnf	krfkgmgfmlfbmfkgbm	flkdmblmdb 	114	2027-02-05	1397	Поточний студент	gavriliuk.olha@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	accepted	2025-11-05 22:23:27.613151+02	2025-11-09 16:37:11.657689+02	114	\N	2025-11-05 22:23:27.613151+02	2025-11-09 16:37:11.657689+02	\N	coursework	course	\N	\N	\N	\N
17	Архітектура системи розробка студентів на основі сучасні технології	dddddd	wwwwwww	qqqqqqq	104	2026-02-05	104	Поточний студент	dufanets.marta@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	accepted	2025-11-05 22:34:15.784722+02	2025-11-09 18:22:03.801651+02	104	\N	2025-11-05 22:34:15.784722+02	2025-11-09 18:22:03.801651+02	\N	coursework	course	\N	\N	\N	\N
16	Архітектура системи розробка студентів на основі сучасні технології	fffff	vvvvvvv	ddddddd	104	2027-02-05	23	Поточний студент	viiktoria.osoba29@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	accepted	2025-11-05 22:33:29.874034+02	2025-11-09 18:22:07.245493+02	104	\N	2025-11-05 22:33:29.874034+02	2025-11-09 18:22:07.245493+02	\N	coursework	course	\N	\N	\N	\N
8	Інтеграція веб-технології в існуючу інфраструктуру освітніх технологій	fffff	vvvvvv	wwwwww	116	2027-03-14	1396	Поточний студент	rylskiy.olen@lnu.edu.ua	+380000000000	Комп'ютерні науки	3 курс	accepted	2025-11-05 20:31:01.353866+02	2025-11-11 23:00:28.356267+02	116	\N	2025-11-05 20:31:01.353866+02	2025-11-11 23:00:28.356267+02	\N	coursework	course	\N	\N	\N	\N
48	Дослідження ефективності розробка для студентів	vvvvvv	cccccc	cccccc	266	2026-02-22	21	Bodya Dmytriv	Bodya.Dmytriv@lnu.edu.ua	\N	\N	\N	accepted	2025-11-22 00:00:00+02	2025-11-23 00:17:33.548949+02	266	\N	2025-11-23 00:17:07.339917+02	2025-11-23 00:17:33.548949+02	\N	coursework	course	\N	\N	\N	\N
22	Архітектура системи розробка навчального процесу на основі AI	атататататат	уууууу	ццццццццц	1378	2026-02-09	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	accepted	2025-11-09 00:00:00+02	2025-11-09 17:57:12.755795+02	1378	\N	2025-11-09 17:56:44.785585+02	2025-11-09 17:57:12.755795+02	\N	coursework	course	\N	\N	\N	\N
23	Аналіз ROI системи дослідження для користувачі	fffff	ffdddddd	fffffff	104	2026-02-08	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	accepted	2025-11-09 00:00:00+02	2025-11-09 18:22:00.854627+02	104	\N	2025-11-09 18:21:39.391736+02	2025-11-09 18:22:00.854627+02	\N	coursework	course	\N	\N	\N	\N
24	Методологія оцінки якості дослідження навчального процесу	ddddd	dddddd	dddddddd	105	2026-02-09	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	accepted	2025-11-09 00:00:00+02	2025-11-09 23:58:13.528965+02	105	\N	2025-11-09 23:57:54.313143+02	2025-11-09 23:58:13.528965+02	\N	coursework	course	\N	\N	\N	\N
25	Архітектура системи розробка навчального процесу на основі AI	vvvvv	mmmmmm	vcccccc	107	2026-02-11	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	accepted	2025-11-11 00:00:00+02	2025-11-11 23:26:09.297704+02	107	\N	2025-11-11 23:25:16.477009+02	2025-11-11 23:26:09.297704+02	\N	coursework	course	\N	\N	\N	\N
26	Методологія оцінки якості розробка навчального процесу	vvvv	vvvv	vvvvvvv	105	2026-02-11	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-11 00:00:00+02	\N	\N	\N	2025-11-11 23:29:42.56059+02	2025-11-11 23:29:42.56059+02	\N	coursework	course	\N	\N	\N	\N
27	Алгоритми підвищення якості для освітніх технологій	ccccc	vvvvvvv	eeeeeee	1385	2026-02-11	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	accepted	2025-11-11 00:00:00+02	2025-11-12 00:17:51.012259+02	1385	\N	2025-11-12 00:17:03.177202+02	2025-11-12 00:17:51.012259+02	\N	coursework	course	\N	\N	\N	\N
28	Порівняльний аналіз існуючих рішень для підвищення якості	vvvvvvv	vvvvvvvvv	vvvvvvvvvvvv	105	2026-02-12	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 11:30:00.410509+02	2025-11-12 11:30:00.410509+02	\N	coursework	course	\N	\N	\N	\N
29	Технології обробки даних в системі дослідження навчального процесу	йфяцічувскамепинртгоьшл	ььаьааьаьаьаьаьа	аоккооккооккококо	115	2026-02-12	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 12:48:05.889267+02	2025-11-12 12:48:05.889267+02	\N	coursework	course	\N	\N	\N	\N
30	Управління проектом розробка студентів	ddddddddd	dddddd	ddddddd	113	2026-02-12	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 12:57:56.348265+02	2025-11-12 12:57:56.348265+02	\N	coursework	course	\N	\N	\N	\N
31	Управління проектом розробка студентів	zzzzzzzzz	rrrrrrrr	ffffffff	113	2026-02-12	1396	Студент	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 13:37:45.567818+02	2025-11-12 13:37:45.567818+02	\N	coursework	course	\N	\N	\N	\N
32	Інтерфейс користувача для системи розробка студентів	vvvvvvvvvv	vvvvvvvvvv	fffffffffff	111	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	Факультет електроніки та компʼютерних технологій	4	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 14:30:24.798186+02	2025-11-12 14:30:24.798186+02	\N	coursework	course	\N	\N	\N	\N
33	Аналіз ROI системи дослідження для користувачі	vvvvvvv	ffffff	fffffffff	108	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 20:40:33.350216+02	2025-11-12 20:40:33.350216+02	\N	coursework	course	\N	\N	\N	\N
34	Порівняльний аналіз існуючих рішень для підвищення якості	gggggg	bbbbbbb	mmmmmm	105	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	+380960654915	Факультет електроніки та компʼютерних технологій	4	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 21:07:38.625054+02	2025-11-12 21:07:38.625054+02	\N	coursework	course	\N	\N	\N	\N
35	Технології обробки даних в системі дослідження навчального процесу	bbbbbbb	jjjjjjjj	hhhhhbkgb	115	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	+380960654915	Факультет електроніки та компʼютерних технологій	4	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 22:03:58.714895+02	2025-11-12 22:03:58.714895+02	\N	coursework	course	\N	\N	\N	\N
36	Інтерфейс користувача для системи дослідження навчального процесу	gggg	gggggg	gggggg	107	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 22:21:17.238886+02	2025-11-12 22:21:17.238886+02	\N	coursework	course	\N	\N	\N	\N
37	Архітектура системи дослідження навчального процесу на основі блокчейн	gggg	fffffff	gggggg	107	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 22:31:46.316056+02	2025-11-12 22:31:46.316056+02	\N	coursework	course	\N	\N	\N	\N
38	Архітектура системи дослідження навчального процесу на основі блокчейн	ffff	ddddd	fffffff	1378	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-12 22:52:40.552364+02	2025-11-12 22:52:40.552364+02	\N	coursework	course	\N	\N	\N	\N
39	Технології обробки даних в системі розробка студентів	vvvv	vvvvvv	vvvvvvvv	118	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	\N	\N	accepted	2025-11-12 00:00:00+02	2025-11-13 00:01:19.042602+02	118	\N	2025-11-13 00:00:52.527876+02	2025-11-13 00:01:19.042602+02	\N	coursework	course	\N	\N	\N	\N
40	Інтеграція сучасні технології в існуючу інфраструктуру літератури	vvvv	vvvvvv	vvvvvv	114	2026-02-12	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	\N	\N	pending	2025-11-12 00:00:00+02	\N	\N	\N	2025-11-13 00:55:29.840325+02	2025-11-13 00:55:29.840325+02	\N	coursework	course	\N	\N	\N	\N
41	Інтеграція мобільні технології в існуючу інфраструктуру планування часу	bbbbb	kkkkkk	yyyyyyyy	118	2026-02-13	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	\N	\N	accepted	2025-11-13 00:00:00+02	2025-11-13 12:46:49.514647+02	118	\N	2025-11-13 12:46:17.994556+02	2025-11-13 12:46:49.514647+02	\N	coursework	course	\N	\N	\N	\N
42	Гейміфікація в системі розробка для підвищення мотивації	vvvvvv	vvvvvvvv	ffffffffff	116	2026-02-13	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	\N	\N	\N	accepted	2025-11-13 00:00:00+02	2025-11-13 13:28:30.856962+02	116	\N	2025-11-13 13:28:12.116267+02	2025-11-13 13:28:30.856962+02	\N	coursework	course	\N	\N	\N	\N
43	Аналіз ROI системи розробка для студенти	nnnnn	bbbbbbb	bbbbbbb	571	2026-02-13	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	+380960654915	Факультет електроніки та компʼютерних технологій	4	accepted	2025-11-13 00:00:00+02	2025-11-13 22:20:06.831659+02	571	\N	2025-11-13 22:18:34.995361+02	2025-11-13 22:20:06.831659+02	\N	coursework	course	\N	\N	\N	\N
44	Архітектура системи розробка студентів на основі мобільні технології	ffffff	fffffff	ffffffff	1385	2026-02-13	1396	Олег Рильський	rylskiy.olen@lnu.edu.ua	+380960654915	Факультет електроніки та компʼютерних технологій	4	accepted	2025-11-13 00:00:00+02	2025-11-13 22:50:00.831155+02	1385	\N	2025-11-13 22:49:45.008025+02	2025-11-13 22:50:00.831155+02	\N	coursework	course	\N	\N	\N	\N
45	Дослідження ефективності розробка для студентів	qqqq	qqqq	qqqq	283	2026-02-16	21	Bodya Dmytriv	Bodya.Dmytriv@lnu.edu.ua	\N	\N	\N	accepted	2025-11-16 00:00:00+02	2025-11-17 01:12:25.040027+02	283	\N	2025-11-17 01:12:06.09899+02	2025-11-17 01:12:25.040027+02	\N	coursework	course	\N	\N	\N	\N
46	Інтеграція мобільні технології в існуючу інфраструктуру планування часу	qqqq	qqqq	qqqq	266	2026-02-17	21	Bodya Dmytriv	Bodya.Dmytriv@lnu.edu.ua	\N	\N	\N	accepted	2025-11-17 00:00:00+02	2025-11-17 09:52:13.512527+02	266	\N	2025-11-17 09:51:57.249439+02	2025-11-17 09:52:13.512527+02	\N	coursework	course	\N	\N	\N	\N
47	Дослідження ефективності розробка для студентів	vvvvv	vvvvvv	vvvvvvvv	946	2026-02-18	21	Bodya Dmytriv	Bodya.Dmytriv@lnu.edu.ua	\N	\N	\N	accepted	2025-11-18 00:00:00+02	2025-11-18 17:12:34.611684+02	946	\N	2025-11-18 17:12:12.097854+02	2025-11-18 17:12:34.611684+02	\N	coursework	course	\N	\N	\N	\N
49	Аналіз потреб студенти в контексті літератури	dddddd	dddddd	fffffff	234	2026-03-01	1408	dfmfmffm ddddddd	fmfmffm@lnu.edu.ua	\N	Факультет міжнародних відносин	3	accepted	2025-11-29 00:00:00+02	2025-11-30 00:42:23.717885+02	234	\N	2025-11-30 00:41:50.182547+02	2025-11-30 00:42:23.717885+02	МБА-31	coursework	course	\N	\N	\N	\N
50	Інтеграція веб-технології в існуючу інфраструктуру освітніх технологій	fffff	fffffff	fffffff	266	2026-03-01	1409	ffffjfjffj fmfffjfjfjf	vjvgjgjgj@lnu.edu.ua	\N	Факультет прикладної математики та інформатики	2	accepted	2025-11-29 00:00:00+02	2025-11-30 01:41:31.786679+02	266	\N	2025-11-30 01:41:05.488592+02	2025-11-30 01:41:31.786679+02	ППМ-22	coursework	course	\N	\N	\N	\N
51	Дослідження ефективності розробка для студентів	ccccc	ccccc	ccccccc	730	2026-03-02	1410	bbbb ccccccc	cmvmvmv@lnu.edu.ua	\N	Факультет міжнародних відносин	3	accepted	2025-11-30 00:00:00+02	2025-11-30 02:03:39.613753+02	730	\N	2025-11-30 02:02:57.672883+02	2025-11-30 02:03:39.613753+02	МІН-32	coursework	course	\N	\N	\N	\N
52	Аналіз потреб користувачі в контексті освіти	bbbbb	mmmmm	vvvvvv	940	2026-03-14	1411	fgggg bbbhgfffd	ghbnvfgh@lnu.edu.ua	\N	Факультет прикладної математики та інформатики	2	accepted	2025-12-01 00:00:00+02	2025-12-01 20:41:06.114368+02	940	\N	2025-12-01 20:40:32.251862+02	2025-12-01 20:41:06.114368+02	ППМ-21	coursework	course	\N	\N	\N	\N
53	Дослідження ефективності розробка для навчального процесу	ffffff	fffffff	ffffffff	580	2026-03-28	1428	Студент	fnfjfjdf@lnu.edu.ua			3	pending	2025-12-28 13:17:48.388622+02	\N	\N	\N	2025-12-28 13:17:48.388622+02	2025-12-28 13:17:48.388622+02		coursework	course	45	F3	5	1428
54	Вплив цифровізації на освіти для користувачі	fffff	dddddddd	eeeeeeeeeeee	1376	2026-03-28	1428	jgngnff fmmvmfmd	fnfjfjdf@lnu.edu.ua		Комп'ютерні науки	3	pending	2025-12-28 13:35:39.653768+02	\N	\N	\N	2025-12-28 13:35:39.653768+02	2025-12-28 13:35:39.653768+02	ФеІ-31	coursework	course	45	F3	5	1428
55	Інтеграція сучасні технології в існуючу інфраструктуру літератури	fffff	eeeeeee	frfffffff	575	2026-05-02	1428	jgngnff fmmvmfmd	fnfjfjdf@lnu.edu.ua		Комп'ютерні науки	3	pending	2025-12-28 13:41:48.603199+02	\N	\N	\N	2025-12-28 13:41:48.603199+02	2025-12-28 13:41:48.603199+02	ФеІ-31	coursework	course	45	F3	5	1428
\.


--
-- Data for Name: student_assignments; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_assignments (id, student_id, place_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_deadlines; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_deadlines (id, user_id, milestone, deadline_date, status, priority, submitted_at, created_at) FROM stdin;
\.


--
-- Data for Name: student_goals; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_goals (id, user_id, goal, description, deadline, status, priority, progress, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_profiles (id, user_id, group_name, course, bio, avatar_url, phone, linkedin_url, github_url, created_at, updated_at, student_group) FROM stdin;
1	21	\N	4		\N	\N	\N	\N	2025-10-27 15:19:05.682415	2025-10-27 15:19:05.682415	ФеІ-42
2	23	\N			\N	\N	\N	\N	2025-11-08 20:19:16.691204	2025-11-08 20:19:16.691204	ФеІ-44
3	1396	\N	4	123456789iufmfmgng gndgn jdnfksfnkjv nrfjh kdjkd	\N	+380960654915	\N	\N	2025-11-12 12:16:46.005022	2025-11-12 20:02:06.007353	FeI-44
4	1428	\N	\N		\N		\N	\N	2025-12-14 21:42:58.953518	2025-12-14 21:42:58.953518	\N
5	1427	\N	\N		\N		\N	\N	2025-12-28 12:59:11.470498	2025-12-28 12:59:11.470498	\N
\.


--
-- Data for Name: student_projects; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_projects (id, user_id, title, type, status, description, technologies, project_url, github_url, start_date, end_date, created_at, updated_at) FROM stdin;
3	1396	ffffff	ffffff	fffffff		\N	\N	\N	\N	\N	2025-11-11 23:28:57.258557	2025-11-11 23:28:57.258557
4	1396	qqqqqq	qqqqqq	qqqqqq	qqqqqqq	\N	\N	\N	\N	\N	2025-11-12 13:08:18.148075	2025-11-12 13:08:18.148075
\.


--
-- Data for Name: student_topics; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.student_topics (id, student_id, project_type, topic, description, goals, requirements, teacher_id, teacher_name, status, created_at, approved_at) FROM stdin;
1	118	coursework	Інтеграція мобільні технології в існуючу інфраструктуру планування часу	bbbbb	Метою роботи є реалізація проекту відповідно до вимог завдання	Вимоги до виконання роботи згідно з методичними рекомендаціями	118	\N	approved	2025-11-13 12:46:49.585293	\N
\.


--
-- Data for Name: teacher_comments; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.teacher_comments (id, chapter_id, teacher_id, text, status, type, created_at) FROM stdin;
\.


--
-- Data for Name: teacher_future_topics; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.teacher_future_topics (id, user_id, topic, description, created_at) FROM stdin;
4	105	Генеративний AI в творчості та мистецтві	Дослідження застосування генеративних моделей у створенні мистецьких творів, музики, текстів	2025-11-01 15:01:41.929035
5	106	Етика штучного інтелекту та соціальні наслідки	Дослідження етичних аспектів розвитку та використання AI, вплив на суспільство та працю	2025-11-01 15:01:41.929035
20	571	Радіохвилі в кліматичних дослідженнях	Застосування радіофізичних методів для вивчення кліматичних змін	2025-11-05 13:41:24.52303
21	572	Підводна радіофізика	Дослідження поширення радіохвиль у морському середовищі	2025-11-05 13:41:24.52303
22	573	Радіомоніторинг навколишнього середовища	Розробка систем моніторингу забруднення довкілля	2025-11-05 13:41:24.52303
23	574	Квантова радіофізика	Дослідження квантових ефектів у радіофізичних системах	2025-11-05 13:41:24.52303
24	575	Хаотичні комунікації	Застосування хаотичних систем для захисту інформації в комунікаціях	2025-11-05 13:41:24.52303
25	576	Нелінійна оптика	Дослідження нелінійних оптичних явищ для створення нових приладів	2025-11-05 13:41:24.52303
26	577	Інтегровані фотонні схеми	Дослідження можливості створення повністю фотонних інтегральних схем для обчислень	2025-11-05 13:51:33.158977
27	578	Квантові комунікації	Розробка систем захищеної квантової комунікації на основі фотоніки	2025-11-05 13:51:33.158977
28	579	Квантові точки в лазерах	Дослідження застосування квантових точок у лазерних системах нового покоління	2025-11-05 13:51:33.158977
29	580	Медичні лазерні системи	Розробка лазерних систем для неінвазивної діагностики та лікування	2025-11-05 13:51:33.158977
30	582	Біосенсори на основі оптики	Створення високочутливих біосенсорів для медичної діагностики	2025-11-05 13:51:33.158977
31	583	Розумні сенсорні мережі	Розробка інтелектуальних сенсорних мереж для промислового Інтернету речей	2025-11-05 13:51:33.158977
32	77	Автоматизована калібрування	Створення систем автоматичної калібрування оптичного обладнання	2025-11-05 13:51:33.158977
33	78	Метрологія для нанотехнологій	Розробка метрологічних методів для наноелектроніки	2025-11-05 13:51:33.158977
34	104	Когнітивна радіолокація	Дослідження радіолокаційних систем з елементами штучного інтелекту	2025-11-05 13:51:33.158977
35	105	Космічна радіонавігація	Розробка систем навігації для космічних апаратів	2025-11-05 13:51:33.158977
36	106	Нейроморфні обчислення	Дослідження архітектур нейроморфних обчислювальних систем	2025-11-05 13:51:33.158977
37	107	Квантові алгоритми	Розробка нових алгоритмів для квантових комп'ютерів	2025-11-05 13:51:33.158977
38	108	6G технології	Дослідження технологічних рішень для мереж шостого покоління	2025-11-05 13:51:33.158977
65	104	Промисловий інтернет речей	Застосування IoT у промислових умовах	2025-11-05 13:51:33.158977
66	105	Нейронні мережі для обробки сигналів	Застосування AI для аналізу та обробки сигналів	2025-11-05 13:51:33.158977
67	106	Адаптивні аудіосистеми	Розробка систем, що адаптуються до акустичного середовища	2025-11-05 13:51:33.158977
68	107	Метаматеріали для антен	Дослідження антен на основі метаматеріалів	2025-11-05 13:51:33.158977
69	108	Інтелектуальні антенні системи	Розробка антен з адаптивними характеристиками	2025-11-05 13:51:33.158977
70	109	Квантові сенсори	Створення високочутливих сенсорів на основі квантових явищ	2025-11-05 13:51:33.158977
71	110	Квантова метрологія	Застосування квантових ефектів для точних вимірювань	2025-11-05 13:51:33.158977
72	111	Машинне навчання для моделювання	Застосування ML для покращення математичних моделей	2025-11-05 13:51:33.158977
73	112	Глибоке навчання в наукових дослідженнях	Використання deep learning для аналізу експериментальних даних	2025-11-05 13:51:33.158977
74	113	Віртуальні лабораторії	Створення цифрових аналогів лабораторних стендів	2025-11-05 13:51:33.158977
75	114	Дистанційні експерименти	Розробка систем для віддаленого проведення лабораторних робіт	2025-11-05 13:51:33.158977
76	115	Топологічні ізолятори	Дослідження нових класів матеріалів для електроніки	2025-11-05 13:51:33.158977
77	116	2D матеріали	Вивчення властивостей двовимірних матеріалів	2025-11-05 13:51:33.158977
78	117	Системи з штучним інтелектом	Інтеграція AI в системне проектування	2025-11-05 13:51:33.158977
63	77	Квантові фотодетектори	Створення детекторів для квантових комунікацій	2025-11-05 13:51:33.158977
64	78	Енергоавтономні IoT пристрої	Розробка пристроїв з альтернативними джерелами живлення	2025-11-05 13:51:33.158977
79	118	Кібер-фізичні системи	Розробка інтегрованих фізико-цифрових систем	2025-11-05 13:51:33.158977
80	119	Архітектура мікросервісів	Проектування масштабованих мікросервісних архітектур	2025-11-05 13:51:33.158977
81	570	Domain-Driven Design	Застосування DDD підходу у розробці ПЗ	2025-11-05 13:51:33.158977
41	111	Підводна радіофізика	Дослідження поширення радіохвиль у морському середовищі	2025-11-05 13:51:33.158977
42	112	Радіомоніторинг навколишнього середовища	Розробка систем моніторингу забруднення довкілля	2025-11-05 13:51:33.158977
43	113	Квантова радіофізика	Дослідження квантових ефектів у радіофізичних системах	2025-11-05 13:51:33.158977
44	114	Хаотичні комунікації	Застосування хаотичних систем для захисту інформації в комунікаціях	2025-11-05 13:51:33.158977
45	115	Нелінійна оптика	Дослідження нелінійних оптичних явищ для створення нових приладів	2025-11-05 13:51:33.158977
46	116	Радіоспостереження екзопланет	Пошук та дослідження планет за межами Сонячної системи	2025-11-05 13:51:33.158977
47	117	Космічний інтерферометр	Розробка системи радіотелескопів для високої роздільної здатності	2025-11-05 13:51:33.158977
48	118	AI в управлінні проектами	Застосування штучного інтелекту для прогнозування ризиків проектів	2025-11-05 13:51:33.158977
50	570	Квантові мережі	Дослідження мереж на основі квантової комунікації	2025-11-05 13:51:33.158977
51	571	6G технології	Архітектура мереж шостого покоління	2025-11-05 13:51:33.158977
52	572	Розподілені бази даних	Створення високодоступних розподілених систем	2025-11-05 13:51:33.158977
53	573	Бази даних для IoT	Оптимізація СКБД для інтернету речей	2025-11-05 13:51:33.158977
54	574	Веб-асемблер	Застосування WebAssembly для високопродуктивних веб-додатків	2025-11-05 13:51:33.158977
55	575	Прогресивні веб-додатки	Розробка офлайн-здатних веб-додатків	2025-11-05 13:51:33.158977
56	576	Квантова криптографія	Дослідження методів захисту на основі квантової механіки	2025-11-05 13:51:33.158977
57	577	Захист IoT пристроїв	Розробка систем безпеки для інтернету речей	2025-11-05 13:51:33.158977
58	578	Edge computing	Дослідження розподілених обчислень на периферії мережі	2025-11-05 13:51:33.158977
59	579	Безсерверні архітектури	Оптимізація додатків на основі serverless підходу	2025-11-05 13:51:33.158977
60	580	GitOps	Впровадження GitOps практик для управління інфраструктурою	2025-11-05 13:51:33.158977
61	582	Platform Engineering	Створення внутрішніх платформ для розробників	2025-11-05 13:51:33.158977
62	583	Оптоелектронні інтегральні схеми	Розробка комплексних оптоелектронних мікросхем	2025-11-05 13:51:33.158977
82	571	AR/VR у мобільних додатках	Інтеграція доповненої та віртуальної реальності	2025-11-05 13:51:33.158977
83	572	Крос-платформні фреймворки	Порівняння та оптимізація крос-платформних рішень	2025-11-05 13:51:33.158977
84	573	Тестування на основі ML	Застосування машинного навчання для автоматизації тестування	2025-11-05 13:51:33.158977
85	574	DevTestOps	Інтеграція тестування в DevOps процеси	2025-11-05 13:51:33.158977
86	575	Генеративні моделі	Дослідження генеративних архітектур для створення контенту	2025-11-05 13:51:33.158977
87	576	Explainable AI	Розробка інтерпретованих моделей штучного інтелекту	2025-11-05 13:51:33.158977
88	577	Квантові оптичні мережі	Дослідження мереж для квантової комунікації	2025-11-05 13:51:33.158977
89	578	Плазмонні волокна	Розробка нових типів оптичних волокон	2025-11-05 13:51:33.158977
90	579	Наноелектронні прилади	Дослідження електронних компонентів нанорозмірів	2025-11-05 13:51:33.158977
91	580	Молекулярна електроніка	Розробка електронних приладів на молекулярному рівні	2025-11-05 13:51:33.158977
92	582	Гнучкі дисплеї	Дослідження технологій гнучких екранів	2025-11-05 13:51:33.158977
93	583	Голографічні дисплеї	Розробка систем голографічного відображення	2025-11-05 13:51:33.158977
94	77	Фотонні кристали	Дослідження кристалів з фотонними властивостями	2025-11-05 13:51:33.158977
95	78	Метаматеріали для оптики	Розробка матеріалів з унікальними оптичними властивостями	2025-11-05 13:51:33.158977
96	104	Біомедична електроніка	Розробка електронних пристроїв для медицини	2025-11-05 13:51:33.158977
97	105	Носимий електронні пристрої	Проектування електроніки для носимих технологій	2025-11-05 13:51:33.158977
7	108	Квантові комунікації	Розробка систем захищеної квантової комунікації на основі фотоніки	2025-11-05 13:41:24.52303
8	109	Квантові точки в лазерах	Дослідження застосування квантових точок у лазерних системах нового покоління	2025-11-05 13:41:24.52303
9	110	Медичні лазерні системи	Розробка лазерних систем для неінвазивної діагностики та лікування	2025-11-05 13:41:24.52303
10	111	Біосенсори на основі оптики	Створення високочутливих біосенсорів для медичної діагностики	2025-11-05 13:41:24.52303
11	112	Розумні сенсорні мережі	Розробка інтелектуальних сенсорних мереж для промислового Інтернету речей	2025-11-05 13:41:24.52303
12	113	Автоматизована калібрування	Створення систем автоматичної калібрування оптичного обладнання	2025-11-05 13:41:24.52303
13	114	Метрологія для нанотехнологій	Розробка метрологічних методів для наноелектроніки	2025-11-05 13:41:24.52303
14	115	Когнітивна радіолокація	Дослідження радіолокаційних систем з елементами штучного інтелекту	2025-11-05 13:41:24.52303
15	116	Космічна радіонавігація	Розробка систем навігації для космічних апаратів	2025-11-05 13:41:24.52303
16	117	Нейроморфні обчислення	Дослідження архітектур нейроморфних обчислювальних систем	2025-11-05 13:41:24.52303
17	118	Квантові алгоритми	Розробка нових алгоритмів для квантових комп'ютерів	2025-11-05 13:41:24.52303
18	119	6G технології	Дослідження технологічних рішень для мереж шостого покоління	2025-11-05 13:41:24.52303
19	570	Космічні комунікації	Розробка систем зв'язку для міжпланетних місій	2025-11-05 13:41:24.52303
98	106	Нейроморфні обчислювальні системи	Дослідження архітектур, що імітують роботу мозку	2025-11-05 13:51:33.158977
99	107	Квантові комп'ютери	Архітектура квантових обчислювальних систем	2025-11-05 13:51:33.158977
100	108	Безпека операційних систем	Дослідження методів захисту ОС від кібератак	2025-11-05 13:51:33.158977
101	109	Реалізація мов програмування	Розробка компіляторів та інтерпретаторів	2025-11-05 13:51:33.158977
102	110	Моделювання кліматичних змін	Застосування комп'ютерних моделей для прогнозування клімату	2025-11-05 13:51:33.158977
103	111	Цифрові двійники	Створення віртуальних копій фізичних об'єктів	2025-11-05 13:51:33.158977
104	112	Квантова теорія інформації	Дослідження інформаційних процесів у квантових системах	2025-11-05 13:51:33.158977
105	113	Квантова заплутаність	Вивчення явища заплутаності та його застосування	2025-11-05 13:51:33.158977
106	114	Алгоритми для квантових комп'ютерів	Розробка алгоритмів, оптимізованих для квантових обчислень	2025-11-05 13:51:33.158977
107	115	Паралельні обчислення	Дослідження методів паралелізації обчислювальних задач	2025-11-05 13:51:33.158977
49	119	Віртуальні команди	Управління розподіленими IT-командами	2025-11-05 13:51:33.158977
6	107	Інтегровані фотонні схеми	Дослідження можливості створення повністю фотонних інтегральних схем для обчислень	2025-11-05 13:41:24.52303
39	109	Космічні комунікації	Розробка систем зв'язку для міжпланетних місій	2025-11-05 13:51:33.158977
40	110	Радіохвилі в кліматичних дослідженнях	Застосування радіофізичних методів для вивчення кліматичних змін	2025-11-05 13:51:33.158977
\.


--
-- Data for Name: teacher_profiles; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.teacher_profiles (id, user_id, title, bio, avatar_url, office_hours, phone, website, created_at, updated_at) FROM stdin;
1	22	асистент				39595949322		2025-10-27 12:23:44.056689	2025-11-05 00:20:06.226018
2	113				Пн-Пт 14:00-16:00			2025-11-12 13:01:00.596816	2025-11-12 13:01:00.596816
3	109				Пн-Пт 09:00 - 20:00	+380967454913		2025-12-12 23:18:41.400006	2025-12-12 23:18:41.400006
\.


--
-- Data for Name: teacher_research_directions; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.teacher_research_directions (id, user_id, area, description, created_at) FROM stdin;
4	105	Штучний інтелект та машинне навчання	Дослідження в галузі AI, нейронних мереж, глибокого навчання та їх практичного застосування	2025-11-01 15:01:41.928392
7	108	Фотонні обчислення	Розробка архітектур фотонних комп'ютерів та обчислювальних систем	2025-11-05 13:49:21.778145
10	111	Сенсорні системи	Створення високочутливих сенсорів на основі оптичних технологій	2025-11-05 13:49:21.778145
11	112	Інтелектуальні вимірювання	Розробка систем автоматичного моніторингу та управління технологічними процесами	2025-11-05 13:49:21.778145
12	113	Метрологія оптичних систем	Розробка методів та засобів метрологічного забезпечення оптичного обладнання	2025-11-05 13:49:21.778145
13	114	Контроль якості	Створення систем контролю якості для електронного виробництва	2025-11-05 13:49:21.778145
14	115	Радіолокаційні технології	Дослідження та розробка радіолокаційних систем для цивільного застосування	2025-11-05 13:49:21.778145
15	116	Радіонавігаційні системи	Розробка сучасних систем навігації та позиціонування	2025-11-05 13:49:21.778145
16	117	Архітектура комп'ютерних систем	Дослідження архітектурних рішень для високопродуктивних обчислень	2025-11-05 13:49:21.778145
17	118	Квантові обчислення	Розробка архітектур та алгоритмів для квантових комп'ютерів	2025-11-05 13:49:21.778145
18	119	Мобільні мережі	Дослідження технологій майбутніх поколінь мобільних мереж	2025-11-05 13:49:21.778145
19	570	Бездротові технології	Розробка протоколів та архітектур для бездротових сенсорних мереж	2025-11-05 13:49:21.778145
20	571	Радіофізика	Теоретичні та експериментальні дослідження поширення радіохвиль	2025-11-05 13:49:21.778145
21	572	Електродинаміка	Дослідження електромагнітних явищ у складних середовищах	2025-11-05 13:49:21.778145
22	573	Атмосферна радіофізика	Застосування радіофізичних методів для дослідження атмосфери	2025-11-05 13:49:21.778145
23	574	Цифрова обробка сигналів	Розробка алгоритмів обробки радіосигналів	2025-11-05 13:49:21.778145
24	575	Нелінійна динаміка	Дослідження нелінійних явищ у радіотехнічних системах	2025-11-05 13:49:21.778145
25	576	Теорія коливань	Теоретичні основи коливальних процесів у технічних системах	2025-11-05 13:49:21.778145
26	577	Радіоастрономія	Дослідження космічних об'єктів за допомогою радіотелескопів	2025-11-05 13:49:21.778145
27	578	Астрофізика	Вивчення фізичних процесів у Всесвіті	2025-11-05 13:49:21.778145
28	579	Управління проектами	Методології та інструменти управління IT-проектами	2025-11-05 13:49:21.778145
29	580	Гнучкі методології	Дослідження та вдосконалення Agile підходів	2025-11-05 13:49:21.778145
30	582	Комп'ютерні мережі	Архітектура та протоколи сучасних мереж	2025-11-05 13:49:21.778145
31	583	Цифрова обробка сигналів	Алгоритми обробки аудіо, відео та інших сигналів	2025-11-05 13:49:21.778145
32	77	Бази даних	Дослідження систем управління базами даних	2025-11-05 13:49:21.778145
33	78	Big Data	Технології обробки великих обсягів даних	2025-11-05 13:49:21.778145
34	104	Веб-технології	Розробка сучасних веб-додатків	2025-11-05 13:49:21.778145
35	105	Frontend розробка	Технології клієнтської частини додатків	2025-11-05 13:49:21.778145
36	106	Кібербезпека	Захист інформаційних систем від кібератак	2025-11-05 13:49:21.778145
37	107	Криптографія	Розробка методів захисту інформації	2025-11-05 13:49:21.778145
38	108	Хмарні обчислення	Архітектура та сервіси хмарних платформ	2025-11-05 13:49:21.778145
39	109	AWS та Azure	Дослідження можливостей провідних хмарних платформ	2025-11-05 13:49:21.778145
40	110	DevOps	Інтеграція розробки та експлуатації	2025-11-05 13:49:21.778145
41	111	CI/CD	Автоматизація процесів розгортання додатків	2025-11-05 13:49:21.778145
42	112	Оптоелектронні прилади	Розробка та дослідження оптоелектронних компонентів	2025-11-05 13:49:21.778145
43	113	Фотодетектори	Створення високочутливих фотоприймачів	2025-11-05 13:49:21.778145
44	114	Вбудовані системи	Архітектура та програмування мікроконтролерів	2025-11-05 13:49:21.778145
63	77	Крос-платформова розробка	Розробка додатків для різних платформ	2025-11-05 13:49:21.778145
64	78	Тестування ПЗ	Методики та інструменти тестування програм	2025-11-05 13:49:21.778145
65	104	Автоматизація QA	Автоматизація процесів забезпечення якості	2025-11-05 13:49:21.778145
66	105	Штучний інтелект	Дослідження алгоритмів штучного інтелекту	2025-11-05 13:49:21.778145
5	106	Data Science та аналіз даних	Аналіз даних, статистичні методи, візуалізація даних та прийняття рішень на основі даних	2025-11-01 15:01:41.928392
8	109	Квантова електроніка	Дослідження квантових явищ у лазерних системах та їх практичне застосування	2025-11-05 13:49:21.778145
9	110	Лазерні технології	Розробка нових лазерних технологій для промисловості та медицини	2025-11-05 13:49:21.778145
67	106	Машинне навчання	Розробка та вдосконалення ML алгоритмів	2025-11-05 13:49:21.778145
68	107	Волоконна оптика	Технології волоконно-оптичного зв'язку	2025-11-05 13:49:21.778145
69	108	Оптичні мережі	Архітектура та управління оптичними мережами	2025-11-05 13:49:21.778145
70	109	Мікроелектроніка	Технології виробництва мікроелектронних компонентів	2025-11-05 13:49:21.778145
71	110	Напівпровідникові прилади	Дослідження властивостей напівпровідникових приладів	2025-11-05 13:49:21.778145
72	111	Системи відображення	Технології відображення інформації	2025-11-05 13:49:21.778145
73	112	Дисплейні технології	Розробка та вдосконалення дисплеїв	2025-11-05 13:49:21.778145
6	107	Оптоелектронні системи	Дослідження та розробка інтегрованих оптоелектронних систем для телекомунікацій	2025-11-05 13:49:21.778145
46	116	Цифрова обробка сигналів	Алгоритми обробки аналогових сигналів	2025-11-05 13:49:21.778145
47	117	Цифрові фільтри	Теорія та практика цифрової фільтрації	2025-11-05 13:49:21.778145
48	118	Радіочастотна техніка	Проектування РЧ-схем та пристроїв	2025-11-05 13:49:21.778145
49	119	Антенні системи	Розробка та оптимізація антен	2025-11-05 13:49:21.778145
50	570	Квантова радіофізика	Дослідження квантових ефектів у радіосистемах	2025-11-05 13:49:21.778145
51	571	Квантова оптика	Квантові явища в оптичних системах	2025-11-05 13:49:21.778145
52	572	Комп'ютерне моделювання	Чисельні методи для моделювання фізичних процесів	2025-11-05 13:49:21.778145
53	573	Математичне моделювання	Застосування математичних методів у дослідженнях	2025-11-05 13:49:21.778145
54	574	Електронні вимірювання	Метрологія електронних вимірювальних систем	2025-11-05 13:49:21.778145
55	575	Лабораторний практикум	Методика проведення лабораторних робіт	2025-11-05 13:49:21.778145
56	576	Фізика твердого тіла	Дослідження властивостей твердих тіл	2025-11-05 13:49:21.778145
57	577	Напівпровідникові матеріали	Вивчення властивостей напівпровідників	2025-11-05 13:49:21.778145
58	578	Системний аналіз	Методології аналізу складних систем	2025-11-05 13:49:21.778145
59	579	Системна архітектура	Проектування архітектур технічних систем	2025-11-05 13:49:21.778145
60	580	Архітектура ПЗ	Проектування архітектур програмних систем	2025-11-05 13:49:21.778145
61	582	Патерни проектування	Шаблони проектування програмного забезпечення	2025-11-05 13:49:21.778145
62	583	Мобільна розробка	Технології розробки мобільних додатків	2025-11-05 13:49:21.778145
74	113	Оптичні матеріали	Дослідження властивостей оптичних матеріалів	2025-11-05 13:49:21.778145
75	114	Функціональні матеріали	Розробка матеріалів з спеціальними властивостями	2025-11-05 13:49:21.778145
76	115	Електронні пристрої	Проектування електронних пристроїв	2025-11-05 13:49:21.778145
77	116	Схемотехніка	Теорія та практика проектування електронних схем	2025-11-05 13:49:21.778145
78	117	Цифрова електроніка	Дослідження цифрових схем та систем	2025-11-05 13:49:21.778145
79	118	Мікропроцесорна техніка	Архітектура та програмування мікропроцесорів	2025-11-05 13:49:21.778145
80	119	Системне програмування	Розробка низькорівневого програмного забезпечення	2025-11-05 13:49:21.778145
81	570	Операційні системи	Архітектура та функціонування операційних систем	2025-11-05 13:49:21.778145
82	571	Комп'ютерне моделювання	Чисельні методи для наукових досліджень	2025-11-05 13:49:21.778145
83	572	Математичне моделювання	Застосування математичних моделей у техніці	2025-11-05 13:49:21.778145
84	573	Квантова радіофізика	Дослідження квантових явищ у радіофізиці	2025-11-05 13:49:21.778145
85	574	Нелінійна динаміка	Аналіз нелінійних процесів у фізичних системах	2025-11-05 13:49:21.778145
86	575	Комп'ютерні технології	Застосування комп'ютерних технологій у науці	2025-11-05 13:49:21.778145
87	576	Алгоритми та програмування	Розробка та оптимізація алгоритмів	2025-11-05 13:49:21.778145
45	115	Internet of Things	Технології та протоколи для інтернету речей	2025-11-05 13:49:21.778145
\.


--
-- Data for Name: teacher_students; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.teacher_students (id, teacher_id, student_id, created_at, student_name, student_email, student_phone, student_avatar, course, faculty, specialty, work_type, work_title, start_date, deadline, progress, status, application_id, grade, unread_comments, last_activity, student_bio, confirmed_at, supervisor, program, year) FROM stdin;
\.


--
-- Data for Name: teacher_works; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.teacher_works (id, user_id, title, type, year, description, file_url, publication_url, created_at) FROM stdin;
5	78	Штучний інтелект в освіті: сучасні підходи	research	2024	Дослідження застосування штучного інтелекту в навчальному процесі, аналіз ефективності AI-інструментів	\N	https://example.com/ai-education	2025-11-01 15:01:41.924369
6	78	Машинне навчання для аналізу великих даних	publication	2023	Методи та алгоритми машинного навчання для обробки та аналізу великих наборів даних	\N	https://example.com/ml-bigdata	2025-11-01 15:01:41.924369
7	106	Сучасні оптоелектронні системи для телекомунікацій	Стаття	2023	Дослідження новітніх оптоелектронних рішень для високошвидкісних мереж	\N	https://example.com/optoelectronics	2025-11-05 13:41:24.514566
8	106	Фотоніка в обчислювальних системах	Монографія	2022	Застосування фотонних технологій у сучасних комп'ютерах	\N	https://example.com/photonics	2025-11-05 13:41:24.514566
9	107	Квантові лазери нового покоління	Стаття	2023	Розробка та дослідження квантових лазерних систем	\N	https://example.com/quantum_lasers	2025-11-05 13:41:24.514566
10	107	Лазерна техніка в медицині	Доповідь	2022	Застосування лазерних технологій у сучасній медицині	\N	https://example.com/medical_lasers	2025-11-05 13:41:24.514566
11	104	Оптичні сенсори для промисловості 4.0	Стаття	2023	Розробка високочутливих оптичних сенсорів для автоматизації	\N	https://example.com/optical_sensors	2025-11-05 13:41:24.514566
12	104	Інтелектуальні вимірювальні системи	Патент	2022	Система автоматичного моніторингу технологічних процесів	\N	https://example.com/smart_measurement	2025-11-05 13:41:24.514566
13	109	Метрологічне забезпечення оптичних систем	Стаття	2023	Методи калібрування та верифікації оптичного обладнання	\N	https://example.com/metrology	2025-11-05 13:41:24.514566
14	109	Контроль якості в електронному виробництві	Навчальний посібник	2021	Сучасні підходи до контролю якості електронних компонентів	\N	https://example.com/quality_control	2025-11-05 13:41:24.514566
15	110	Радіолокаційні системи для цивільного застосування	Стаття	2023	Розробка радіолокаційних систем моніторингу довкілля	\N	https://example.com/radar_systems	2025-11-05 13:41:24.514566
16	110	Сучасні системи радіонавігації	Монографія	2022	Аналіз та перспективи розвитку радіонавігаційних технологій	\N	https://example.com/radionavigation	2025-11-05 13:41:24.514566
17	111	Архітектура квантових комп'ютерів	Стаття	2023	Дослідження архітектурних рішень для квантових обчислень	\N	https://example.com/quantum_architecture	2025-11-05 13:41:24.514566
18	111	Високопродуктивні обчислювальні системи	Доповідь	2022	Оптимізація продуктивності суперкомп'ютерів	\N	https://example.com/hpc	2025-11-05 13:41:24.514566
19	112	5G та майбутні покоління мобільних мереж	Стаття	2023	Дослідження технологій для мереж шостого покоління	\N	https://example.com/5g_6g	2025-11-05 13:41:24.514566
20	112	Бездротові сенсорні мережі	Монографія	2021	Архітектура та протоколи бездротових сенсорних мереж	\N	https://example.com/wsn	2025-11-05 13:41:24.514566
21	113	Поширення радіохвиль в умовах міської забудови	Стаття	2023	Моделювання поширення радіосигналів в урбаністичному середовищі	\N	https://example.com/radio_propagation	2025-11-05 13:41:24.514566
22	113	Електродинаміка складних середовищ	Навчальний посібник	2022	Теоретичні основи електродинаміки для інженерів	\N	https://example.com/electrodynamics	2025-11-05 13:41:24.514566
23	117	Радіофізичні методи дослідження атмосфери	Стаття	2023	Застосування радіохвиль для моніторингу атмосферних явищ	\N	https://example.com/atmosphere_research	2025-11-05 13:41:24.514566
24	117	Цифрова обробка радіосигналів	Монографія	2021	Сучасні алгоритми обробки радіосигналів	\N	https://example.com/signal_processing	2025-11-05 13:41:24.514566
25	118	Нелінійна динаміка в радіотехнічних системах	Стаття	2023	Дослідження нелінійних явищ у радіоелектронних пристроях	\N	https://example.com/nonlinear_dynamics	2025-11-05 13:41:24.514566
26	118	Теорія хаосу та її застосування	Доповідь	2022	Практичне застосування теорії хаосу в техніці	\N	https://example.com/chaos_theory	2025-11-05 13:41:24.514566
27	119	Сучасні оптоелектронні системи для телекомунікацій	Стаття	2023	Дослідження новітніх оптоелектронних рішень для високошвидкісних мереж	\N	https://example.com/optoelectronics	2025-11-05 13:42:32.958254
28	119	Фотоніка в обчислювальних системах	Монографія	2022	Застосування фотонних технологій у сучасних комп'ютерах	\N	https://example.com/photonics	2025-11-05 13:42:32.958254
29	108	Квантові лазери нового покоління	Стаття	2023	Розробка та дослідження квантових лазерних систем	\N	https://example.com/quantum_lasers	2025-11-05 13:42:32.958254
31	114	Оптичні сенсори для промисловості 4.0	Стаття	2023	Розробка високочутливих оптичних сенсорів для автоматизації	\N	https://example.com/optical_sensors	2025-11-05 13:42:32.958254
33	115	Метрологічне забезпечення оптичних систем	Стаття	2023	Методи калібрування та верифікації оптичного обладнання	\N	https://example.com/metrology	2025-11-05 13:42:32.958254
34	115	Контроль якості в електронному виробництві	Навчальний посібник	2021	Сучасні підходи до контролю якості електронних компонентів	\N	https://example.com/quality_control	2025-11-05 13:42:32.958254
35	571	Радіолокаційні системи для цивільного застосування	Стаття	2023	Розробка радіолокаційних систем моніторингу довкілля	\N	https://example.com/radar_systems	2025-11-05 13:42:32.958254
36	571	Сучасні системи радіонавігації	Монографія	2022	Аналіз та перспективи розвитку радіонавігаційних технологій	\N	https://example.com/radionavigation	2025-11-05 13:42:32.958254
37	572	Архітектура квантових комп'ютерів	Стаття	2023	Дослідження архітектурних рішень для квантових обчислень	\N	https://example.com/quantum_architecture	2025-11-05 13:42:32.958254
38	572	Високопродуктивні обчислювальні системи	Доповідь	2022	Оптимізація продуктивності суперкомп'ютерів	\N	https://example.com/hpc	2025-11-05 13:42:32.958254
39	573	5G та майбутні покоління мобільних мереж	Стаття	2023	Дослідження технологій для мереж шостого покоління	\N	https://example.com/5g_6g	2025-11-05 13:42:32.958254
40	573	Бездротові сенсорні мережі	Монографія	2021	Архітектура та протоколи бездротових сенсорних мереж	\N	https://example.com/wsn	2025-11-05 13:42:32.958254
41	574	Поширення радіохвиль в умовах міської забудови	Стаття	2023	Моделювання поширення радіосигналів в урбаністичному середовищі	\N	https://example.com/radio_propagation	2025-11-05 13:42:32.958254
42	574	Електродинаміка складних середовищ	Навчальний посібник	2022	Теоретичні основи електродинаміки для інженерів	\N	https://example.com/electrodynamics	2025-11-05 13:42:32.958254
43	575	Радіофізичні методи дослідження атмосфери	Стаття	2023	Застосування радіохвиль для моніторингу атмосферних явищ	\N	https://example.com/atmosphere_research	2025-11-05 13:42:32.958254
44	575	Цифрова обробка радіосигналів	Монографія	2021	Сучасні алгоритми обробки радіосигналів	\N	https://example.com/signal_processing	2025-11-05 13:42:32.958254
45	576	Нелінійна динаміка в радіотехнічних системах	Стаття	2023	Дослідження нелінійних явищ у радіоелектронних пристроях	\N	https://example.com/nonlinear_dynamics	2025-11-05 13:42:32.958254
46	576	Теорія хаосу та її застосування	Доповідь	2022	Практичне застосування теорії хаосу в техніці	\N	https://example.com/chaos_theory	2025-11-05 13:42:32.958254
47	578	Радіоастрономічні дослідження галактик	Стаття	2023	Спектроскопічні дослідження галактик за допомогою радіотелескопів	\N	https://example.com/radio_astronomy	2025-11-05 13:47:14.209221
48	578	Космічне випромінювання та його джерела	Монографія	2022	Дослідження джерел космічного радіовипромінювання	\N	https://example.com/cosmic_radiation	2025-11-05 13:47:14.209221
49	579	Управління IT-проектами в умовах невизначеності	Стаття	2023	Методології управління проектами в динамічному середовищі	\N	https://example.com/project_management	2025-11-05 13:47:14.209221
50	579	Гнучкі методології розробки	Навчальний посібник	2022	Практичне застосування Agile, Scrum та Kanban	\N	https://example.com/agile_methodologies	2025-11-05 13:47:14.209221
51	583	Комп'ютерні мережі нового покоління	Стаття	2023	Архітектура та протоколи для мереж майбутнього	\N	https://example.com/nextgen_networks	2025-11-05 13:47:14.209221
52	583	Цифрова обробка сигналів у реальному часі	Монографія	2022	Алгоритми та архітектури для обробки сигналів	\N	https://example.com/realtime_dsp	2025-11-05 13:47:14.209221
53	582	Оптимізація запитів у великих базах даних	Стаття	2023	Методи підвищення продуктивності баз даних	\N	https://example.com/database_optimization	2025-11-05 13:47:14.209221
54	582	NoSQL бази даних у сучасних додатках	Навчальний посібник	2022	Порівняльний аналіз та застосування NoSQL рішень	\N	https://example.com/nosql_databases	2025-11-05 13:47:14.209221
55	580	Сучасні веб-фреймворки та їх порівняння	Стаття	2023	Аналіз популярних веб-фреймворків та їх ефективності	\N	https://example.com/web_frameworks	2025-11-05 13:47:14.209221
56	580	JavaScript для розробки складних додатків	Монографія	2022	Просунуті техніки програмування на JavaScript	\N	https://example.com/advanced_js	2025-11-05 13:47:14.209221
57	577	Кібербезпека критичних інфраструктур	Стаття	2023	Захист критично важливих інформаційних систем	\N	https://example.com/critical_security	2025-11-05 13:47:14.209221
67	196	Цифрова обробка аудіосигналів	Стаття	2023	Алгоритми обробки та покращення якості звуку	\N	https://example.com/audio_dsp	2025-11-05 13:47:14.209221
68	196	Адаптивні цифрові фільтри	Монографія	2022	Теорія та практика адаптивної фільтрації	\N	https://example.com/adaptive_filters	2025-11-05 13:47:14.209221
69	197	Антенні системи для мобільних мереж	Стаття	2023	Проектування та оптимізація антенних решіток	\N	https://example.com/antenna_systems	2025-11-05 13:47:14.209221
70	197	РЧ-схеми для бездротових пристроїв	Патент	2022	Радіочастотні схеми для сучасних комунікаційних систем	\N	https://example.com/rf_circuits	2025-11-05 13:47:14.209221
71	199	Квантові оптичні явища	Стаття	2023	Дослідження квантових ефектів у оптичних системах	\N	https://example.com/quantum_optics	2025-11-05 13:47:14.209221
72	199	Нелінійна динаміка в лазерах	Монографія	2022	Теоретичні основи нелінійних процесів у лазерних системах	\N	https://example.com/laser_dynamics	2025-11-05 13:47:14.209221
73	200	Математичне моделювання фізичних процесів	Стаття	2023	Чисельні методи для моделювання складних систем	\N	https://example.com/math_modeling	2025-11-05 13:47:14.209221
74	200	Обчислювальні методи в Matlab	Навчальний посібник	2022	Практичне застосування Matlab для наукових досліджень	\N	https://example.com/matlab_methods	2025-11-05 13:47:14.209221
75	206	Електронні вимірювальні системи	Стаття	2023	Метрологічне забезпечення електронних вимірювань	\N	https://example.com/electronic_measurements	2025-11-05 13:47:14.209221
76	206	Лабораторний практикум з електроніки	Навчальний посібник	2022	Методичні матеріали для практичних занять	\N	https://example.com/electronics_lab	2025-11-05 13:47:14.209221
77	207	Фізика напівпровідникових матеріалів	Стаття	2023	Дослідження властивостей напівпровідників для електроніки	\N	https://example.com/semiconductor_physics	2025-11-05 13:47:14.209221
78	207	Діелектричні матеріали в мікроелектроніці	Монографія	2022	Застосування діелектриків у сучасних мікросхемах	\N	https://example.com/dielectric_materials	2025-11-05 13:47:14.209221
79	209	Системний аналіз складних технічних систем	Стаття	2023	Методології аналізу та проектування систем	\N	https://example.com/system_analysis	2025-11-05 13:47:14.209221
80	209	Архітектура програмно-апаратних комплексів	Доповідь	2022	Підходи до проектування інтегрованих систем	\N	https://example.com/hardware_software	2025-11-05 13:47:14.209221
81	211	Архітектурні патерни проектування ПЗ	Стаття	2023	Сучасні підходи до архітектури програмних систем	\N	https://example.com/design_patterns	2025-11-05 13:47:14.209221
82	211	UML для моделювання бізнес-процесів	Навчальний посібник	2022	Застосування UML для аналізу та проектування	\N	https://example.com/uml_modeling	2025-11-05 13:47:14.209221
83	214	Мобільна розробка для платформи Android	Стаття	2023	Сучасні технології розробки Android-додатків	\N	https://example.com/android_dev	2025-11-05 13:47:14.209221
84	214	Крос-платформова мобільна розробка	Монографія	2022	Порівняння підходів до розробки для iOS та Android	\N	https://example.com/cross_platform	2025-11-05 13:47:14.209221
85	215	Автоматизація тестування програмного забезпечення	Стаття	2023	Методи та інструменти автоматизації QA процесів	\N	https://example.com/test_automation	2025-11-05 13:47:14.209221
86	215	Якість програмного забезпечення	Навчальний посібник	2022	Стандарти та практики забезпечення якості ПЗ	\N	https://example.com/software_quality	2025-11-05 13:47:14.209221
59	570	Хмарні технології для бізнесу	Стаття	2023	Оптимізація бізнес-процесів за допомогою хмарних рішень	\N	https://example.com/cloud_business	2025-11-05 13:47:14.209221
61	77	DevOps практики для сучасних команд	Стаття	2023	Впровадження DevOps культури в IT-компаніях	\N	https://example.com/devops_practices	2025-11-05 13:47:14.209221
62	77	Контейнеризація та оркестрація додатків	Монографія	2022	Docker, Kubernetes та сучасні підходи до розгортання	\N	https://example.com/containerization	2025-11-05 13:47:14.209221
63	105	Оптоелектронні прилади для систем зв'язку	Стаття	2023	Розробка високошвидкісних оптоелектронних компонентів	\N	https://example.com/opto_devices	2025-11-05 13:47:14.209221
64	105	Фотодетектори нового покоління	Патент	2022	Високочутливі фотодетектори для телекомунікацій	\N	https://example.com/photodetectors	2025-11-05 13:47:14.209221
65	116	Вбудовані системи для IoT пристроїв	Стаття	2023	Архітектура та програмування мікроконтролерів	\N	https://example.com/embedded_iot	2025-11-05 13:47:14.209221
66	116	Енергоефективність вбудованих систем	Доповідь	2022	Методи зниження споживання енергії IoT пристроями	\N	https://example.com/energy_efficiency	2025-11-05 13:47:14.209221
87	217	Машинне навчання для обробки природної мови	Стаття	2023	Сучасні алгоритми NLP для української мови	\N	https://example.com/ml_nlp	2025-11-05 13:47:14.209221
88	217	Штучний інтелект в реальних додатках	Монографія	2022	Практичне застосування AI технологій	\N	https://example.com/ai_applications	2025-11-05 13:47:14.209221
89	181	Волоконно-оптичні мережі передачі даних	Стаття	2023	Архітектура та управління оптичними мережами	\N	https://example.com/fiber_networks	2025-11-05 13:47:14.209221
90	181	Оптичні волокна нового покоління	Патент	2022	Розробка високошвидкісних оптичних кабелів	\N	https://example.com/optical_fibers	2025-11-05 13:47:14.209221
91	185	Мікроелектронні компоненти для обчислювальної техніки	Стаття	2023	Дослідження та розробка електронних компонентів	\N	https://example.com/microelectronics	2025-11-05 13:47:14.209221
92	185	Напівпровідникові прилади в силовій електроніці	Монографія	2022	Застосування потужних напівпровідникових приладів	\N	https://example.com/power_electronics	2025-11-05 13:47:14.209221
93	186	Системи відображення інформації для транспортних засобів	Стаття	2023	Розробка дисплеїв для автомобільної електроніки	\N	https://example.com/display_systems	2025-11-05 13:47:14.209221
94	186	Проекційні технології в освіті	Доповідь	2022	Застосування проекторів у навчальному процесі	\N	https://example.com/projection_tech	2025-11-05 13:47:14.209221
95	188	Оптичні матеріали для інфрачервоної техніки	Стаття	2023	Дослідження матеріалів для ІЧ-оптики	\N	https://example.com/ir_materials	2025-11-05 13:47:14.209221
96	188	Функціональні матеріали в оптоелектроніці	Монографія	2022	Застосування спеціальних матеріалів у оптичних приладах	\N	https://example.com/functional_materials	2025-11-05 13:47:14.209221
97	190	Аналогова електроніка для вимірювальної техніки	Стаття	2023	Проектування аналогових схем для точних вимірювань	\N	https://example.com/analog_electronics	2025-11-05 13:47:14.209221
98	190	Схемотехніка радіоприймальних пристроїв	Навчальний посібник	2022	Теорія та практика проектування радіосхем	\N	https://example.com/circuit_design	2025-11-05 13:47:14.209221
99	191	Цифрова електроніка для систем управління	Стаття	2023	Застосування цифрових схем в автоматизованих системах	\N	https://example.com/digital_electronics	2025-11-05 13:47:14.209221
100	191	Програмування ПЛІС для обробки сигналів	Монографія	2022	Методи програмування програмованих логічних інтегральних схем	\N	https://example.com/fpga_programming	2025-11-05 13:47:14.209221
101	193	Системне програмування для вбудованих систем	Стаття	2023	Розробка низькорівневого ПЗ для мікроконтролерів	\N	https://example.com/system_programming	2025-11-05 13:47:14.209221
102	193	Операційні системи реального часу	Навчальний посібник	2022	Архітектура та особливості ОСРЧ	\N	https://example.com/rtos	2025-11-05 13:47:14.209221
103	201	Комп'ютерне моделювання фізичних процесів	Стаття	2023	Чисельні методи для розв'язання задач фізики	\N	https://example.com/physics_modeling	2025-11-05 13:47:14.209221
104	201	Математичне моделювання в технічних системах	Монографія	2022	Застосування математичних методів у інженерії	\N	https://example.com/math_engineering	2025-11-05 13:47:14.209221
105	203	Квантова радіофізика та її застосування	Стаття	2023	Дослідження квантових явищ у радіотехніці	\N	https://example.com/quantum_radiophysics	2025-11-05 13:47:14.209221
106	203	Нелінійна динаміка в радіоелектронних системах	Доповідь	2022	Аналіз нелінійних процесів у радіопристроях	\N	https://example.com/nonlinear_radio	2025-11-05 13:47:14.209221
107	204	Алгоритми та структури даних для інженерних задач	Стаття	2023	Ефективні алгоритми для обчислювальної техніки	\N	https://example.com/algorithms_engineering	2025-11-05 13:47:14.209221
108	204	Програмування для наукових досліджень	Навчальний посібник	2022	Мови програмування та інструменти для науки	\N	https://example.com/scientific_programming	2025-11-05 13:47:14.209221
30	108	Лазерна техніка в медицині	Доповідь	2022	Застосування лазерних технологій у сучасній медицині	\N	https://example.com/medical_lasers	2025-11-05 13:42:32.958254
32	114	Інтелектуальні вимірювальні системи	Патент	2022	Система автоматичного моніторингу технологічних процесів	\N	https://example.com/smart_measurement	2025-11-05 13:42:32.958254
58	577	Криптографічні протоколи нового покоління	Доповідь	2022	Розробка та аналіз сучасних криптографічних методів	\N	https://example.com/crypto_protocols	2025-11-05 13:47:14.209221
60	570	Міграція в хмару: стратегії та практики	Навчальний посібник	2022	Практичні поради щодо переходу на хмарні технології	\N	https://example.com/cloud_migration	2025-11-05 13:47:14.209221
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.teachers (full_name, department_id, skills, id) FROM stdin;
Ольга Дика	3	["альгологія", "мікологія"]	32
Ігор Шайного	20	["палеоекологія", "тафономія", "мікрофауна"]	460
Євген Ланюк	110	["філософія техніки", "технічна філософія", "філософія технологій"]	1298
Євген Майовець	27	["маркетингові дослідження", "аналіз ринку", "поведінка споживачів"]	89
Євген Цікало	29	["облік в банках", "банківські операції", "фінансові послуги"]	98
Євгенія Сливко	19	["меліоративна геологія", "дренажні системи", "гірська гідрогеологія"]	456
Іван Базарко	90	["регіональна економіка", "регіональний розвиток", "просторова економіка"]	961
Іван Бехта	41	["граматика англійської мови", "синтаксис", "морфологія"]	596
Іван Болеста	34	["квантова радіофізика", "квантова оптика", "нелінійна динаміка"]	574
Іван Брацук	76	["конституційне право ЄС", "договірне право ЄС", "правова система ЄС"]	724
Іван Васильків	69	["теорія ймовірностей", "математична статистика", "випадкові процеси"]	697
Іван Дияк	83	["оптимізація", "математичне програмування", "дослідження операцій"]	946
Іван Звізло	68	["механіка деформівного твердого тіла", "опір матеріалів", "будівельна механіка"]	199
Іван Карбовник	34	["радіофізика", "електродинаміка", "поширення радіохвиль"]	109
Іван Катеринчук	32	["електронні компоненти", "мікроелектроніка", "напівпровідникові прилади"]	1377
Іван Когутіч	116	["криміналістика", "криміналістична техніка", "криміналістична тактика"]	1332
Іван Круглов	17	["загальна фізична географія", "геоморфологія", "кліматологія"]	434
Іван Мандзак	45	["методика викладання іспанської", "іншомовна освіта", "дидактика"]	634
Іван Михасюк	25	["регіональна економіка", "територіальний розвиток", "регіональна політика"]	1365
Іван Парубчак	90	["публічні фінанси", "бюджетний процес", "фіскальна політика"]	960
Іван Прокопишин	89	["законодавство у кібербезпеці", "кіберправо", "нормативна база"]	944
Іван Хвищун	34	["радіоастрономія", "астрофізика", "спостережна радіофізика"]	112
Іван Щерба	99	["дефекти кристалів", "дислокації", "вакансії"]	997
Іванна Мельник	60	["комп'ютерна алгебра", "алгоритми в алгебрі", "символьні обчислення"]	208
Ігор Бойко	108	["історія культури", "культурна історія", "історична культурологія"]	1045
Ігор Грабинський	71	["міжнародні економічні відносини", "глобальна економіка", "міжнародна торгівля"]	237
Ігор Губич	18	["геохімія", "біогеохімія", "ендогенні процеси"]	65
Ігор Гуран	60	["алгебраїчна геометрія", "комутативна алгебра", "схеми"]	719
Ігор Гілевич	52	["етнічні дослідження", "етнічна історія", "етногенез"]	650
Ігор Дикий	5	["гідробіологія", "екологія безхребетних"]	43
Ігор Заєць	115	["президентське право", "статус президента", "повноваження президента"]	380
Ігор Земан	70	["право міжнародних конфліктів", "мирне вирішення спорів", "міжнародні суди"]	743
Ігор Капрусь	9	["екологія тварин", "зоологія"]	38
Ігор Катерняк	34	["квантова радіофізика", "квантова оптика", "нелінійна динаміка"]	1384
Ігор Колесник	108	["релігієзнавство", "релігійна культура", "історія релігій"]	353
Ігор Колич	35	["кібербезпека", "мережева безпека", "криптографія"]	117
Ігор Кондратішин	41	["комп'ютерна лінгвістика", "обробка природної мови", "корпусна лінгвістика"]	134
Ігор Кошмак	96	["радіоастрономія", "радіотелескопи", "радіоспектроскопія"]	305
Ігор Крупка	22	["міжнародні фінанси", "валютні ринки", "платіжні баланси"]	87
Ігор Кузь	68	["теорія коливань", "нелінійні коливання", "динамічні системи"]	708
Ігор Макар	83	["математична економіка", "економетрика", "фінансова математика"]	949
Ігор Мрака	53	["археологічне краєзнавство", "польові дослідження", "археологічні памятки"]	190
Ігор Назаркевич	94	["інвестиційний менеджмент", "управління інвестиціями", "інвестиційні проекти"]	296
Ірина Ласько	117	["права інвалідів", "інклюзія", "соціальна інтеграція"]	391
Ігор Олексів	117	["соціальний захист людей похилого віку", "геронтологічне право", "соціальна підтримка"]	1346
Ігор Оленич	33	["радіоелектронні системи", "радіолокація", "радіонавігація"]	106
Ігор Осадчук	106	["політична соціологія", "соціологія політики", "політичні інститути"]	342
Ігор Павлюк	40	["сучасна українська преса", "газетна журналістика", "періодичні видання"]	125
Ігор Паславський	40	["українська журналістика", "національні ЗМІ", "медіаринок України"]	593
Ігор Пасічник	108	["культурна політика", "управління культурою", "культурні інституції"]	1051
Ігор Пацай	111	["спектрофотометрія", "УФ-спектроскопія", "ІЧ-спектроскопія"]	1304
Ігор Половинко	32	["волоконна оптика", "оптичні волокна", "оптичні мережі"]	1376
Ігор Романич	95	["штучний інтелект в бізнесі", "AI", "машинне навчання"]	303
Ігор Фурик	117	["реабілітаційне право", "соціальна реабілітація", "реінтеграція"]	395
Ігор Хамар	5	["еволюційна зоологія", "філогенія тварин"]	45
Ігор Цимбалістий	45	["історична лінгвістика", "етимологія", "діалектологія"]	157
Ігор Чижиков	66	["функціональні рівняння", "інтегральні рівняння", "диференціальні рівняння"]	711
Ігор Штаблавий	99	["фізичне матеріалознавство", "матеріали", "структура матеріалів"]	323
Ігор Якубівський	118	["арбітражний процес", "арбітражне судочинство", "господарські спори"]	1356
Інга Петровська	107	["психологія розвитку", "вікова психологія", "психологія дитини"]	346
Інна Бойчук	27	["цифровий маркетинг", "інтернет-маркетинг", "контент-маркетинг"]	90
Інна Галецька	107	["соціальна психологія", "психологія спілкування", "міжособистісні відносини"]	1036
Інна Куліш	90	["економіка культури", "творчі індустрії", "фінансування культури"]	963
Інна Позднякова	88	["еволюційні алгоритми", "генетичні алгоритми", "оптимізація"]	933
Інна Прокопчук	59	["театрознавство", "історія театру", "театральна критика"]	1393
Ірина Іваночко	76	["трудове право ЄС", "соціальна політика ЄС", "права працівників"]	230
Ірина Ілійчук	103	["корейська мова", "кореїстика", "корейська філологія"]	1018
Ірина Базилевич	67	["екстремальні значення", "теорія екстремумів", "розподіли екстремумів"]	704
Ірина Байцар	45	["французька література", "франкомовна література", "література Франції"]	629
Ірина Бернакович	86	["бізнес-аналітика", "аналіз даних", "звітність"]	267
Ірина Борщук	95	["бізнес-аналітика", "data analytics", "аналіз даних"]	980
Ірина Бродяк	2	["біохімія білків", "методи очистки протеїнів", "аналіз протеїнів"]	408
Ірина Бундза	101	["фонетика польської мови", "артикуляція", "просодія"]	327
Ірина Верба	69	["комплексний аналіз", "функції комплексної змінної", "операційне числення"]	698
Ірина Верес	118	["транспортне право", "перевезення", "транспортні договори"]	1359
Ірина Гнилякевич-Проць	27	["ритейл-маркетинг", "торговий маркетинг", "мерчандайзинг"]	91
Ірина Городняк	27	["маркетинг послуг", "сервісний маркетинг", "управління якістю послуг"]	471
Ірина Грабинська	22	["економетрика", "статистичний аналіз", "математичне моделювання"]	465
Ірина Демко	29	["облік доходів", "визнання доходів", "дохід від реалізації"]	101
Ірина Добропас	110	["філософія історії", "істориософія", "філософія історичного процесу"]	1297
Ірина Ділай	41	["бібліографія", "текстологія", "критичне читання"]	132
Ірина Зубрицька-Макота	79	["соціальна робота з сім'ями", "сімейна соціальна робота", "робота з батьками"]	923
Ірина Киянка	74	["дипломатична служба", "дипломатія", "консульська служба"]	233
Ірина Козій	86	["тестування програмного забезпечення", "QA", "автоматизація тестування"]	937
Ірина Куречко	106	["політична філософія", "філософія політики", "політичні концепції"]	1031
Ірина Кушнір	44	["феміністична критика", "гендерні дослідження", "феміністична теорія"]	627
Ірина Маковецька	56	["оперна майстерність", "вокальна педагогіка", "оперна сцена"]	209
Ірина Олінська	68	["гідродинаміка", "аеродинаміка", "механіка рідин"]	581
Ірина Побережська	21	["мінералогія", "кристалографія", "гемологія"]	83
Ірина Процик	40	["редакційна політика", "медіаменеджмент", "управління редакцією"]	126
Ірина Роздольська	104	["теорія літератури", "літературознавча методологія", "аналіз текстів"]	1022
Ірина Субашкевич	79	["кризова інтервенція", "екстрена соціальна допомога", "кризова робота"]	261
Ірина Тяжкороб	93	["фінансовий аналіз", "оцінка бізнесу", "інвестиційний аналіз"]	295
Ірина Шевчук	95	["цифрова економіка", "електронна комерція", "інтернет-економіка"]	979
Ірина Яворська	76	["міжнародне право ЄС", "зовнішні відносини ЄС", "торгові угоди"]	728
Алла Герц	118	["цивільний процес", "цивільне судочинство", "процесуальне право"]	396
Алла Кравчук	101	["граматика польської мови", "морфологія", "синтаксис"]	1003
Алла Марчук	79	["соціальна робота з інвалідами", "інклюзія", "реабілітація"]	925
Алла Паславська	46	["міжкультурна комунікація", "крос-культурні дослідження", "комунікативна компетенція"]	638
Алла Середяк	53	["історія міст і сіл", "урбаністична історія", "містознавство"]	176
Алла Татаренко	102	["словацька мова", "словацька філологія", "слов'янські мови"]	1009
Альона Войнарович	116	["кіберкриміналістика", "комп'ютерна криміналістика", "розслідування кіберзлочинів"]	1336
Анастасія Генега	1	["клітинна біофізика", "транспорт речовин", "мембранні потенціали"]	405
Анастасія Одіцова	3	["екологія рослин", "фітоценологія"]	413
Анатолій Волошиновський	97	["експериментальна фізика", "фізичний експеримент", "лабораторні дослідження"]	989
Анатолій Капелюшний	39	["мовна норма", "орфографія", "пунктуація"]	123
Анатолій Карась	110	["філософія", "теорія філософії", "філософські дисципліни"]	355
Анатолій Музичук	85	["веб-розробка", "frontend", "backend"]	283
Анатолій Найда	116	["фоноскопічна експертиза", "дослідження голосу", "аудіоекспертиза"]	387
Анатолій Романюк	106	["політологія", "політичні науки", "теорія політики"]	1029
Анатолій Смалійчук	17	["геоінформаційні системи", "картографія", "дистанційне зондування"]	54
Андрій Бабський	1	["біофізика мембран", "молекулярне моделювання", "кінетика біологічних процесів"]	403
Андрій Байцар	10	["екологічна географія", "оцінка природних ресурсів", "геоекологія"]	431
Андрій Богуцький	11	["палеогеографія", "четвертинна геологія", "стратиграфія"]	55
Андрій Бокотей	5	["орнітологія", "етологія"]	42
Андрій Бондаренко	59	["театральний костюм", "сценічний костюм", "історичний костюм"]	220
Андрій Васьків	108	["візуальна культура", "мистецтвознавство", "образотворче мистецтво"]	351
Андрій Водичев	59	["сценічна пластика", "сценічний рух", "хореографія"]	1391
Андрій Галушка	6	["медична мікробіологія", "імунологія"]	46
Андрій Гаталевич	69	["вища математика", "математичний аналіз", "диференціальні рівняння"]	696
Андрій Голова	85	["C++", "STL", "низькорівневе програмування"]	953
Андрій Гукалюк	25	["економіка інфраструктури", "транспортна система", "комунікації"]	1367
Андрій Дахній	105	["історія філософії", "філософська думка", "філософські течії"]	1027
Андрій Дем'янчук	59	["акторська майстерність", "сценічна гра", "акторська техніка"]	194
Андрій Заяць	48	["архівознавство", "архівна справа", "документознавство"]	656
Андрій Зубик	10	["соціально-економічна географія", "географія населення", "урбаністика"]	50
Андрій Ковбасюк	56	["оркестрове диригування", "симфонічна музика", "оркестрова практика"]	664
Андрій Козицький	50	["історія європейської інтеграції", "ЄС", "євроінтеграція"]	184
Андрій Мацкевич	103	["арабська мова", "арабістика", "семітські мови"]	334
Андрій Мельник	38	["міжнародна комунікація", "крос-культурна комунікація", "глобалізація інформації"]	586
Андрій Наконечний	110	["філософія права", "правова філософія", "філософські основи права"]	1299
Андрій Павлишин	116	["відеотехнічні дослідження", "відеоекспертиза", "аналіз відеозаписів"]	1339
Андрій Панарін	106	["міжнародні політичні відносини", "глобальна політика", "міжнародна політика"]	1032
Андрій Переймибіда	83	["теорія ймовірностей", "статистика", "випадкові процеси"]	950
Андрій Пехник	71	["міжнародний менеджмент", "крос-культурний менеджмент", "глобальні стратегії"]	740
Андрій Прокопів	3	["охорона рідкісних видів рослин", "гербарна справа"]	34
Андрій Пушак	97	["вакуумна техніка", "вакуумні системи", "вакуумні технології"]	992
Андрій Савула	42	["антична філософія", "грецька філософія", "римська філософія"]	614
Андрій Саган	60	["теорія складності", "алгоритмічна складність", "P та NP"]	723
Андрій Синиця	105	["антична філософія", "грецька філософія", "римська філософія"]	1028
Андрій Содомора	42	["давньогрецька мова", "грецька філологія", "еліністика"]	138
Андрій Стягар	83	["комп'ютерне моделювання", "симуляція", "імітаційні моделі"]	277
Андрій Школик	114	["митне право", "митне регулювання", "митні процедури"]	374
Андрій Яцеленко	57	["театрознавство", "історія театру", "театральна критика"]	672
Андрій Яценко	39	["комунікативні стратегії", "риторика", "публічне виступлення"]	590
Андрій Яцишин	11	["карстознавство", "спелеологія", "підземні води"]	58
Анна Вовк	107	["когнітивна психологія", "пізнавальні процеси", "мислення"]	347
Анна Войтович	78	["методика навчання природознавства", "екологічна освіта", "краєзнавство"]	255
Анна Грицишин	16	["культурний туризм", "етнотуризм", "історичний туризм"]	61
Анна Грищук	28	["фінансовий менеджмент", "управлінський облік", "бюджетування"]	94
Анна Задорожна	95	["цифровий маркетинг", "інтернет-маркетинг", "контент-маркетинг"]	302
Анна Шот	91	["облікова політика", "методологія обліку", "організація обліку"]	968
Антоніна Іваніна	20	["історична геологія", "стратиграфія", "геохронологія"]	80
Антоніна Зубарева	70	["право міжнародної відповідальності", "державна відповідальність", "міжнародні зобов'язання"]	744
Антоніна Тарновська	1	["оптичні методи в біології", "мікроскопія", "спектроскопія"]	406
Аркадій Кабов	45	["переклад з французької", "перекладознавство", "практика перекладу"]	631
Богдан Бокало	60	["комутативна алгебра", "гомологічна алгебра", "категорії"]	717
Богдан Гошко	85	["C#", ".NET", "ASP.NET"]	280
Богдан Гудь	75	["міжнародні фінанси", "фінансові ринки", "інвестиційний аналіз"]	747
Богдан Депутат	95	["великі дані", "big data", "обробка даних"]	981
Богдан Кисляк	56	["музична інформатика", "комп'ютерна музика", "електронна музика"]	1390
Богдан Коман	35	["архітектура програмного забезпечення", "патерни проектування", "UML"]	579
Богдан Котур	113	["хімія напівпровідників", "напівпровідникові матеріали", "електронні матеріали"]	1311
Богдан Максимчук	43	["граматика німецької мови", "словотворення", "синтаксис"]	143
Богдан Мелех	96	["астрофізика", "фізика зірок", "космологія"]	984
Богдан Новосядлий	96	["теоретична астрофізика", "релятивістська астрофізика", "чорні діри"]	985
Богдан Павлишенко	35	["бази даних", "SQL", "проектування баз даних"]	115
Богдан Пшик	93	["фінансовий консалтинг", "консалтингові послуги", "бізнес-консалтинг"]	970
Богдан Соколовський	33	["радіочастотна техніка", "антени", "РЧ-схеми"]	573
Богдан Стельмахович	111	["газова хроматографія", "рідинна хроматографія", "хроматографічні методи"]	1305
Богдан Цибуляк	35	["DevOps", "CI/CD", "контейнеризація"]	119
Богдан Чернюх	45	["іспанська мова", "іберо-романські мови", "іспанська філологія"]	152
Богдана Кріса	104	["сучасна українська література", "сучасна проза", "сучасна поезія"]	1021
Богдана Сипко	50	["історія колоніалізму", "постколоніальні дослідження", "деколонізація"]	654
Богданна Косович	25	["економіка освіти", "освітня політика", "інвестиції в людський капітал"]	402
Богумила Лесечко	46	["комунікативні стратегії", "вербальна комунікація", "невербальна комунікація"]	641
Борис Поляруш	110	["філософія моралі", "етика", "моральна філософія"]	1300
Борис Сулим	74	["регіональні дослідження", "європейські студії", "трансатлантичні відносини"]	734
Вадим Васютинський	107	["клінічна психологія", "психологічна допомога", "психічне здоров'я"]	1035
Валентин Мурадов	116	["почеркознавство", "графологія", "дослідження почерку"]	1338
Валентина Деленко	78	["ігрова діяльність", "ігрові технології", "розвиваючі ігри"]	256
Валентина Загрева	77	["управління освітою", "освітній менеджмент", "адміністрування"]	908
Валентина Марусяк	19	["геодинамічні процеси", "зсуви", "карст"]	79
Валерій Джунь	110	["філософія культури", "культурфілософія", "філософія мистецтва"]	1296
Валерій Корнійчук	104	["українська класична література", "класика", "літературна спадщина"]	335
Валерій Трушевський	89	["безпека мобільних додатків", "mobile security", "захист мобільних пристроїв"]	945
Василь Антонів	24	["теорія ігор", "стратегічне планування", "прийняття рішень"]	72
Василь Буляк	22	["міжнародні фінансові ринки", "капіталовкладення", "фінансові інструменти"]	228
Василь Білецький	83	["обчислювальна математика", "алгоритми", "чисельний аналіз"]	275
Василь Дяків	19	["екологічна геологія", "геоекологія", "охорона геологічного середовища"]	455
Василь Заремба	113	["неорганічний синтез", "синтез неорганічних сполук", "методи синтезу"]	1313
Василь Курляк	97	["фізика твердого тіла", "матеріалознавство", "кристалографія"]	309
Василь Матійчук	112	["стереохімія", "просторова будова", "хіральність"]	365
Василь Нор	116	["криміналістична експертиза", "судова експертиза", "експертні дослідження"]	1333
Василь Рабик	34	["електронні вимірювання", "вимірювальна техніка", "лабораторний практикум"]	575
Василь Репецький	70	["міжнародне публічне право", "договірне право", "міжнародні договори"]	741
Василь Сирватка	4	["популяційна генетика", "еволюційне вчення"]	37
Василь Стадник	98	["загальна фізика", "механіка", "термодинаміка"]	310
Василь Стецький	16	["екскурсійна методика", "інтерпретація культурної спадщини", "музейна справа"]	449
Василь Чура	53	["етнографічне краєзнавство", "народна культура", "традиції"]	661
Володимир Анохін	35	["мобільна розробка", "Android", "iOS"]	580
Володимир Бойко	116	["судова медицина", "медико-криміналістичні дослідження", "експертиза тіла"]	384
Володимир Бурак	117	["трудове право", "право праці", "трудові відносини"]	388
Володимир Біланюк	17	["океанологія", "гідрологія суші", "гідрографія"]	52
Володимир Вовк	86	["хмарні технології", "SaaS", "PaaS"]	936
Володимир Галайчук	52	["українська етнологія", "етнографія України", "народознавство"]	181
Володимир Грабовський	32	["інформаційні технології", "комп'ютерні мережі", "цифрова обробка сигналів"]	114
Володимир Гринчак	70	["право міжнародної безпеки", "право заборонення зброї", "міжнародні санкції"]	242
Володимир Карп'як	112	["механізми органічних реакцій", "реакційні механізми", "органічний синтез"]	1307
Володимир Кахнич	114	["податкове право", "податкове законодавство", "податкові зобов'язання"]	375
Володимир Кобрин	115	["місцеве самоврядування", "конституційні основи місцевого самоврядування", "муніципальне право"]	1329
Володимир Коссак	118	["цивільне право", "приватне право", "цивільне законодавство"]	1351
Володимир Кучинський	59	["історія драматургії", "театральна література", "п'єсознавство"]	219
Володимир Лисик	70	["право прав людини", "міжнародні стандарти прав людини", "Європейський суд з прав людини"]	745
Володимир Матвіїв	17	["геоекологія", "оцінка навколишнього середовища", "природоохоронна географія"]	437
Володимир Микитюк	104	["українська література", "історія української літератури", "літературознавство"]	1020
Володимир Монастирський	16	["організація масових заходів", "event-менеджмент", "фестивальний туризм"]	448
Володимир Павлюк	113	["хімія матеріалів", "матеріалознавство", "функціональні матеріали"]	1312
Володимир Решота	114	["фінансове право", "бюджетне право", "податкове право"]	1318
Володимир Синюта	69	["дискретна математика", "теорія графів", "комбінаторика"]	701
Володимир Станкевич	68	["механіка суцільних середовищ", "пружність", "пластичність"]	198
Володимир Стрепко	117	["охорона праці", "безпека праці", "трудові умови"]	394
Володимир Сулим	46	["практика перекладу", "художній переклад", "спеціалізований переклад"]	639
Володимир Федорович	117	["соціальна допомога", "соціальні виплати", "соціальні послуги"]	1349
Володимир Франів	32	["оптичні матеріали", "функціональні матеріали", "оптичні властивості"]	1379
Володимир Худо	16	["екскурсознавство", "краєзнавство", "турівництво"]	443
Володимир Цікало	118	["нотаріальне право", "нотаріат", "нотаріальні дії"]	1355
Володимир Швець	29	["облік в страхових компаніях", "страхова діяльність", "резерви страховика"]	485
Володимир Юзевич	35	["веб-розробка", "веб-технології", "JavaScript"]	116
Віктор Голубко	53	["історичне краєзнавство", "місцева історія", "регіональна історія"]	660
Віктор Начичко	3	["фізіологія рослин", "рослинні гормони"]	33
Віктор Сеньків	9	["охорона біорізноманіття", "заповідна справа"]	40
Віктор Федоренко	4	["молекулярна генетика", "геноміка"]	414
Вікторія Бридун	60	["теорія полів", "теорія Галуа", "расширення полів"]	206
Вікторія Гупаловська	107	["нейропсихологія", "психологія мозку", "когнітивна нейронаука"]	348
Вікторія Дмитрук	25	["економіка нерухомості", "ринок нерухомості", "інвестиції в нерухомість"]	70
Вікторія Дубас	115	["парламентське право", "законодавчий процес", "парламентаризм"]	1328
Вікторія Дубик	94	["фінансова стратегія", "стратегічне планування", "корпоративна стратегія"]	298
Вікторія Кузьма	70	["право міжнародних територій", "морське право", "повітряне право"]	243
Вікторія Кізима	16	["туристичне країнознавство", "географія туризму", "дестинаційний менеджмент"]	62
Вікторія Лобода	79	["соціальна робота з дітьми", "дитяча соціальна робота", "захист прав дітей"]	924
Вікторія Лучкевич	45	["іспанська культура", "країнознавство Іспанії", "латиноамериканська культура"]	633
Вікторія Малига	70	["міжнародне економічне право", "інвестиційне право", "торгове право"]	244
Віра Другова	93	["страхові технології", "insurtech", "цифрове страхування"]	294
Віра Корнят	79	["соціальна педагогіка", "соціальне виховання", "соціальна робота"]	922
Віра Круглякова	94	["корпоративне управління", "корпоративна політика", "стейкхолдери"]	978
Віталій Брусак	11	["екзогенні процеси", "денудація", "акумуляція"]	56
Віталій Власов	67	["стохастичне моделювання", "Монте-Карло методи", "імітаційне моделювання"]	227
Віталій Гончаренко	3	["систематика вищих рослин", "флористика", "геоботаніка"]	31
Віталій Горлач	86	["інформаційні системи", "архітектура ІС", "проектування ІС"]	264
Віталій Гутник	70	["право міжнародних організацій", "право ООН", "інституційне право"]	241
Віталій Кухарський	83	["математична біологія", "біоінформатика", "моделювання біологічних систем"]	276
Віталій Литвин	106	["політична теорія", "політичні ідеології", "політичні системи"]	341
Віталій Фурман	18	["магніторозвідка", "електророзвідка", "геофізичний моніторинг"]	451
Віталій Чорненький	115	["конституційна безпека", "національна безпека", "конституційні гарантії"]	1331
Галина Антоняк	9	["промислова екологія", "охорона навколишнього середовища"]	418
Галина Байрак	11	["геоморфологічне картографування", "аерофотознімання", "ГІС-аналіз рельєфу"]	439
Галина Бойко	78	["методика навчання грамоти", "читання", "письмо"]	914
Галина Борейко	116	["кримінальна психологія", "психологія злочинності", "психологічна експертиза"]	1335
Галина Бушко	102	["сербська мова", "сербська філологія", "сербохорватська мова"]	1010
Галина Возняк	90	["місцеве самоврядування", "децентралізація", "муніципальне управління"]	286
Галина Гачкова	2	["метаболізм вуглеводів", "метаболізм ліпідів", "біохімія клітинного дихання"]	29
Галина Гоцанюк	20	["седиментологія", "літологія", "фаціальний аналіз"]	458
Галина Звір	6	["вірусологія", "молекулярна біологія вірусів"]	427
Галина Зеліско	69	["функціональний аналіз", "інтегральні рівняння", "оператори"]	699
Галина Капленко	90	["економіка публічного сектору", "державні фінанси", "бюджетна політика"]	957
Галина Квасниця	88	["інтелектуальні системи", "штучний інтелект", "експертні системи"]	929
Галина Клим	33	["електронні пристрої", "схемотехніка", "аналогова електроніка"]	1380
Галина Котовські	43	["німецька література", "літературознавство", "критика"]	618
Галина Крохмальна	78	["дитяча література", "книгознавство", "літературна освіта"]	920
Галина Крук	104	["проза", "прозаїчні твори", "розповідні форми"]	338
Галина Лабінська	10	["країнознавство", "політична географія", "міжнародні відносини"]	432
Галина Лопушанська	67	["теорія міри", "інтеграл Лебега", "функціональні простори"]	226
Галина Мацюк	100	["семантика", "лексикологія", "семасіологія"]	1000
Галина П'ятакова	77	["філософія освіти", "теорія освіти", "методологія педагогіки"]	249
Галина Панчко	32	["системи відображення інформації", "дисплеї", "проекційні системи"]	1378
Галина Яворська	6	["ґрунтова мікробіологія", "агробіологія"]	429
Галина Яновицька	118	["спадкове право", "спадкування", "спадкові відносини"]	1357
Галина Яценко	40	["українська мова в ЗМІ", "мовна політика", "мовна культура"]	595
Ганна Головчак	29	["облік капіталу", "корпоративні фінанси", "структура капіталу"]	100
Ганна Кость	45	["переклад з іспанської", "художній переклад", "технічний переклад"]	632
Ганна Кудринська	55	["соціологія освіти", "освітні дослідження", "соціалізація"]	647
Георгій Шинкаренко	86	["веб-технології", "веб-розробка", "веб-дизайн"]	266
Глорія Бернар	41	["історія англійської мови", "етимологія", "діалектологія"]	598
Григорій Дмитрів	113	["координаційна хімія", "хімія комплексів", "координаційні сполуки"]	368
Григорій Жолткевич	86	["бази даних", "SQL", "NoSQL"]	265
Григорій Рачковський	52	["етнокультурні процеси", "етнічна ідентичність", "етнічні спільноти"]	651
Григорій Шамборовський	71	["міжнародні економічні організації", "ВТО", "МВФ"]	238
Данило Лещух	117	["соціальний захист молоді", "молодіжне право", "молодіжна політика"]	392
Даниїл Журавчак	89	["етичний хакінг", "пентест", "тестування на проникнення"]	943
Дзвенислава Луківська	66	["просторі функції", "функціональні простори", "операторні рівняння"]	712
Дмитро Герцюк	77	["педагогічна психологія", "психологія навчання", "психологія розвитку"]	907
Дмитро Пелешко	89	["forensic", "комп'ютерна криміналістика", "розслідування кіберзлочинів"]	271
Ельвіра Тайнель	56	["музична теорія", "сольфеджіо", "гармонія"]	178
Звенислава Бандура	29	["облік основних засобів", "амортизація", "інвентаризація"]	99
Звенислава Мамчур	9	["загальна екологія", "екологічний моніторинг"]	417
Златислав Дубняк	110	["філософія мови", "лінгвофілософія", "філософія лінгвістики"]	358
Зорина Юринець	28	["управління якістю", "стандарти ISO", "тотальне управління якістю"]	93
Зорислава Ромовська	118	["міжнародне приватне право", "конфлікт права", "транснаціональні спори"]	398
Зоряна Артим-Дрогомирецька	24	["економічна кібернетика", "системний аналіз", "економічне моделювання"]	71
Зоряна Гнатів	56	["народні інструменти", "бандура", "традиційна музика"]	1389
Зоряна Гук	102	["македонська мова", "македонська філологія", "балканські мови"]	1012
Зоряна Гілецька	102	["словенська мова", "словенська філологія", "слов'янські мови"]	331
Зоряна Жигаль	56	["духові інструменти", "деревяні духові", "мідні духові"]	193
Зоряна Лапішко	93	["блокчейн", "криптовалюти", "розподілені реєстри"]	300
Зоряна Макогін	75	["міжнародні інвестиції", "портфельні інвестиції", "прямі інвестиції"]	902
Зоряна Піскозуб	45	["французька мова", "романські мови", "французька філологія"]	628
Зоряна Тенюх	29	["облікова політика", "методологія обліку", "організація обліку"]	102
Зоя Баран	50	["нова історія", "історія нового часу", "європейська історія"]	652
Зоя Скринник	110	["філософія релігії", "релігієзнавство", "філософська теологія"]	357
Зіновій Любунь	34	["теорія коливань", "нелінійні коливання", "динамічні системи"]	111
Зіновія Залога	25	["економіка праці", "ринок праці", "зайнятість"]	1368
Зіновія Шпирка	113	["хімія рідкісноземельних елементів", "лантаноїди", "рідкісні землі"]	1317
Йосип Богдан	118	["корпоративне право", "право компаній", "корпоративне управління"]	401
Йосиф Царик	5	["ентомологія", "паразитологія"]	41
Кароліна Лотоцька	41	["медійна грамотність", "медіаосвіта", "критичне мислення"]	607
Катерина Максимик	60	["комбінаторна теорія груп", "геометрична теорія груп", "гіперболічні групи"]	720
Катерина Назарук	5	["екологія наземних хребетних", "охорона тварин"]	423
Катерина Откович	110	["філософія політики", "політична філософія", "філософія влади"]	360
Костянтин Жерновий	67	["екстремальна теорія ймовірностей", "великі відхилення", "граничні теореми"]	706
Лариса Генералова	20	["тектоніка", "геодинаміка", "структурна геологія"]	81
Лариса Гонтарук	100	["синтаксис", "граматика", "побудова речень"]	1001
Лариса Дідковська	107	["психологія особистості", "теорія особистості", "індивідуальні відмінності"]	1041
Лариса Зомчак	24	["економічна інформатика", "програмування", "алгоритмізація"]	88
Лариса Ковальчук	77	["педагогічна діагностика", "оцінювання навчальних досягнень", "тестування"]	911
Лариса Мандрищук	108	["цифрова культура", "кіберкультура", "інтернет-культура"]	1050
Лев Калиняк	53	["топонімічне краєзнавство", "місцеві назви", "етімологія топонімів"]	662
Леонід Скакун	21	["осадові породи", "седиментологія", "діагенез"]	85
Леонід Хом'як	20	["регіональна геологія", "геологічне картографування", "геологія України"]	459
Леся Клакович	85	["бази даних", "SQL", "проектування БД"]	954
Леся Кінаш	41	["лінгвокраїнознавство", "культурологія", "соціолінгвістика"]	604
Леся Мартіросян	79	["геронтологічна соціальна робота", "робота з людьми похилого віку", "геронтологія"]	260
Любов Боровська	59	["сценічна мова", "дикція", "сценічна промова"]	217
Любов Кияновська	56	["вокал", "академічний спів", "хоровий спів"]	177
Любов Конюхова	39	["креативне письмо", "літературне редагування", "художній текст"]	589
Любов Осташ	102	["слов'янська культура", "слов'янські традиції", "етнокультурологія"]	1015
Любов Петик	94	["міжнародні фінанси", "глобальні фінанси", "валютні операції"]	301
Любов Шевців	91	["контролінг", "управлінський контроль", "системи контролю"]	292
Любомир Безручко	16	["рекреалогія", "оздоровчий туризм", "SPA-індустрія"]	444
Любомир Бораковський	46	["усний переклад", "консекутивний переклад", "синхронний переклад"]	159
Любомир Бориславський	115	["виборче право", "виборча система", "виборчий процес"]	379
Любомир Монастирський	33	["цифрова електроніка", "мікропроцесорна техніка", "ПЛІС"]	1381
Любомир Пархуць	89	["соціальна інженерія", "фішинг", "безпека користувачів"]	940
Любомир Скочиляс	106	["політичний менеджмент", "управління політичними процесами", "політичні технології"]	1033
Любомир Чирун	83	["математичне програмування", "лінійне програмування", "нелінійне програмування"]	951
Людмила Бабійчук	41	["фонетика англійської мови", "артикуляційна база", "інтонація"]	597
Людмила Белінська	58	["соціокультурний менеджмент", "управління культурою", "культурна політика"]	214
Людмила Васильєва	102	["чеська мова", "чеська філологія", "західнослов'янські мови"]	1008
Людмила Войтович	22	["міжнародна економіка", "транснаціональні корпорації", "глобалізація"]	464
Людмила Кобилецька	78	["інклюзивна освіта", "робота з дітьми з ООП", "спеціальна освіта"]	919
Людмила Костів	17	["палеогеографія", "четвертинна геологія", "еволюція ландшафтів"]	436
Людмила Матвейчук	90	["державні закупівлі", "тендерна система", "закупівельна політика"]	959
Людмила Петришин	91	["управлінський облік", "калькуляція", "бюджетування"]	290
Людмила Рижак	110	["гносеологія", "теорія пізнання", "епістемологія"]	1052
Людмила Стахів	69	["математична логіка", "теорія множин", "формальні системи"]	224
Лідія Боднар	4	["цитогенетика", "генетика людини", "медична генетика"]	415
Лідія Демків	35	["тестування програмного забезпечення", "QA", "автоматизація тестування"]	582
Лідія Дубіс	11	["геоморфологія", "неотектоніка", "морфометрія рельєфу"]	438
Лідія Мацевко-Бекерська	44	["порівняльне літературознавство", "компаративістика", "світова література"]	622
Лідія Сафонік	110	["філософія науки", "методологія науки", "філософські проблеми науки"]	1053
Лідія Тасєнкевич	3	["морфологія рослин", "анатомія рослин", "карпологія"]	412
Лілія Бомко	104	["фольклористика", "народна творчість", "усна народна творчість"]	1023
Лілія Вейкрута	29	["облік запасів", "управління запасами", "логістика запасів"]	486
Лілія Гринь	56	["струнні інструменти", "скрипка", "альт"]	192
Лілія Дубенська	111	["аналітична хімія", "хімічний аналіз", "методи аналізу"]	1301
Лілія Дяконук	83	["теорія управління", "оптимальне управління", "системний аналіз"]	948
Лілія Сирота	58	["музейний менеджмент", "управління музеями", "музейна комунікація"]	216
Лілія Українець	71	["транснаціональні корпорації", "прямі іноземні інвестиції", "міжнародний бізнес"]	737
Ліна Глущенко	42	["антична культура", "міфологія", "історія античності"]	609
Максим Корягін	29	["аудит", "внутрішній контроль", "аудиторські процедури"]	483
Максим Максимчук	58	["фандрейзинг", "залучення коштів", "проектне фінансування"]	215
Мар'ян Житарюк	38	["міжнародна журналістика", "зарубіжні ЗМІ", "глобальні медіа"]	584
Мар'ян Кирик	89	["захист від зловмисного ПЗ", "антивірусні технології", "мальвер"]	939
Мар'яна Бігус	75	["міжнародна банківська справа", "банківські операції", "кредитування"]	245
Мар'яна Біль	90	["публічне управління", "державне управління", "адміністрування"]	958
Мар'яна Вдовин	30	["соціальна статистика", "демографічна статистика", "статистика населення"]	1371
Мар'яна Виклюк	28	["управління персоналом", "HR-менеджмент", "організаційний розвиток"]	474
Мар'яна Замроз	28	["підприємництво", "стартапи", "бізнес-планування"]	477
Мар'яна Люта	2	["біохімія гормонів", "сигнальні системи клітини"]	409
Мар'яна Сирко	114	["адміністративна відповідальність", "адміністративні правопорушення", "адміністративні стягнення"]	1322
Мар'яна Федунь	76	["інтелектуальна власність в ЄС", "торгові марки", "патентне право"]	232
Марина Кліманська	107	["психологія стресу", "копінг-стратегії", "стрес-менеджмент"]	349
Марина Костяк	89	["безпека хмарних технологій", "cloud security", "захист даних у хмарі"]	273
Марина Рагуліна	9	["радіоекологія", "оцінка впливу на довкілля"]	419
Маркіян Ваврух	96	["спостережна астрономія", "телескопи", "астрономічні спостереження"]	304
Маркіян Домбровський	42	["класична риторика", "ораторське мистецтво", "публічні виступи"]	610
Маркіян Мальський	74	["міжнародна безпека", "безпекові дослідження", "стратегічні дослідження"]	730
Марта Бура	1	["обчислювальна біологія", "аналіз біомедичних даних", "структурна біоінформатика"]	404
Марта Горинь	28	["інноваційний менеджмент", "управління змінами", "технологічний менеджмент"]	475
Марта Дуфанець	32	["сенсорні системи", "оптичні сенсори", "вимірювальні системи"]	104
Марта Кравчик	118	["інформаційне право", "право інформації", "захист даних"]	1362
Марта Мазур	116	["балістика", "зброєзнавство", "дослідження зброї"]	1337
Марта Мальська	16	["менеджмент туризму", "туроператорська діяльність", "маркетинг у туризмі"]	442
Марта Мочульська	115	["федералізм", "регіоналізм", "територіальний устрій"]	1330
Марта Стельмах	103	["турецька мова", "тюркологія", "тюркські мови"]	1019
Марта Труш	114	["публічні закупівлі", "державні закупівлі", "тендерне право"]	376
Маріанна Біда	71	["міжнародний маркетинг", "глобальні ринки", "експортні стратегії"]	239
Маріанна Гладиш	75	["міжнародні фінансові інститути", "світовий банк", "регіональні банки"]	748
Маріанна Кохан	28	["кризововий менеджмент", "антикризове управління", "ризик-менеджмент"]	479
Маріанна Павлишин	28	["корпоративна культура", "організаційна психологія", "лідерство"]	96
Маріне Елбакідзе	17	["біогеографія", "географія ґрунтів", "ландшафтознавство"]	53
Марія Альчук	108	["теорія культури", "культурологія", "філософія культури"]	1044
Марія Братасюк	110	["онтологія", "метафізика", "філософія буття"]	356
Марія Василишин	102	["хорватська мова", "хорватська філологія", "південнослов'янські мови"]	1011
Марія Ващишин	117	["пенсійне право", "пенсійне забезпечення", "пенсійна система"]	1341
Марія Гарасимлюк	25	["промислова економіка", "індустріальний розвиток", "промислова політика"]	1366
Марія Гнатишин	22	["економічне прогнозування", "макроекономічні моделі", "економічні тенденції"]	1363
Марія Дика	1	["радіаційна біофізика", "вплив фізичних факторів на організм"]	27
Марія Довгань	108	["масова культура", "популярна культура", "медіакультура"]	1048
Марія Заваринська	44	["азійська література", "східна література", "компаративістика"]	149
Марія Квасній	30	["часові ряди", "прогнозування", "аналіз тенденцій"]	1373
Марія Колінько	69	["методи викладання математики", "математична освіта", "дидактика математики"]	700
Марія Конік	113	["хімія каталізу", "каталітичні процеси", "каталізатори"]	371
Марія Косарчін	22	["економічна політика", "державне регулювання", "макроекономічне управління"]	1395
Марія Крива	77	["педагогічна творчість", "інноваційна діяльність", "креативність"]	912
Марія Кут	75	["фінансова аналітика", "фінансове моделювання", "ризик-менеджмент"]	246
Марія Лаврук	10	["транспортна географія", "логістика", "географія послуг"]	433
Марія Михайлів	118	["земельне право", "земельні відносини", "земельне законодавство"]	1353
Марія Нагалєвська	2	["клітинна біохімія", "біохімія апоптозу"]	30
Марія Назаркевич	34	["комп'ютерне моделювання", "чисельні методи", "Matlab"]	578
Марія Ріпей	39	["медіалінгвістика", "дискурс-аналіз", "мовна політика"]	124
Марія Сабадашка	2	["молекулярна біологія", "біохімія нуклеїнових кислот"]	410
Марія Хмелярук	22	["міжнародна торгівля", "тарифні бар'єри", "торгові угоди"]	478
Марія Яцимірська	39	["стилістика", "редагування текстів", "мовна культура"]	122
Микола Багрій	116	["доказове право", "докази", "доказування"]	383
Микола Бокало	67	["теорія ймовірностей", "ймовірнісні процеси", "стохастичний аналіз"]	225
Микола Кобилецький	114	["адміністративне право", "публічне право", "адміністративні процедури"]	373
Микола Крупач	104	["драматургія", "театральна література", "п'єси"]	1025
Микола Обушак	112	["органічна хімія", "хімія вуглецю", "органічні сполуки"]	1306
Микола Павлунь	18	["геофізичні методи пошуків", "сейсморозвідка", "гравірозвідка"]	450
Микола Посівнич	53	["історична демографія", "народонаселення", "демографічні процеси"]	1386
Микола Притула	88	["дискретний аналіз", "дискретна математика", "комбінаторика"]	262
Микола Слободян	68	["механіка руйнування", "тріщиностійкість", "міцність матеріалів"]	709
Микола Тупичак	112	["хімія полімерів", "полімерні матеріали", "полімеризація"]	367
Микола Хом'як	18	["корисні копалини", "мінеральні ресурси", "економічна геологія"]	452
Мирослав Дацко	24	["комп'ютерні системи", "інформаційні технології", "обчислювальні методи"]	1369
Мирослав Дністрянський	10	["геоморфологія України", "палеогеографія", "ландшафтознавство"]	49
Мирослава Дякович	118	["господарське право", "комерційне право", "бізнес-право"]	1352
Мирослава Фроляк	45	["лінгвістика тексту", "дискурс-аналіз", "прагмалінгвістика"]	636
Михайло Білінський	41	["англійська мова", "англійська філологія", "германські мови"]	128
Михайло Ваньовський	57	["акторська майстерність", "сценічний рух", "пластика"]	667
Михайло Грабинський	70	["міжнародне гуманітарне право", "право воєнних конфліктів", "Женевські конвенції"]	742
Михайло Зарічний	60	["математична логіка", "теорія моделей", "теорія доказів"]	716
Михайло Комарницький	74	["міжнародні переговори", "медіація", "дипломатичний протокол"]	732
Михайло Мікієвич	76	["європейське право", "право ЄС", "інститути ЄС"]	229
Михайло Оробчук	28	["промисловий менеджмент", "виробничий менеджмент", "оптимізація виробництва"]	481
Михайло Павлик	33	["телекомунікаційні системи", "системи зв'язку", "мобільні мережі"]	108
Михайло Русиняк	32	["оптичні вимірювання", "метрологія", "контроль якості"]	105
Михайло Симотюк	67	["мартингали", "стохастичне числення", "фінансова математика"]	196
Михайло Яджак	86	["управління ІТ-проектами", "проектний менеджмент", "agile"]	935
Надія Ігнатів	103	["японська мова", "японістика", "японська філологія"]	1017
Надія Банера	25	["аграрна економіка", "сільськогосподарський сектор", "агробізнес"]	69
Надія Бортнік	27	["маркетингові комунікації", "реклама", "PR"]	469
Надія Гапон	107	["педагогічна психологія", "психологія навчання", "освітня психологія"]	345
Надія Завальницька	94	["оцінка бізнесу", "вартість компанії", "методи оцінки"]	976
Надія Заячківська	77	["педагогічна етика", "професійна етика", "етичні стандарти"]	251
Надія Колос	88	["обробка природної мови", "лінгвістичні технології", "текстові аналізи"]	931
Надія Лазарович	108	["урбаністична культура", "міська культура", "культура міста"]	354
Надія Левицька	117	["соціальний захист дітей", "дитяче право", "захист прав дітей"]	1345
Надія Левус	107	["крос-культурна психологія", "етнопсихологія", "культурна психологія"]	350
Надія Лобур	102	["етимологія слов'янських мов", "слов'янська лексика", "історична лексикологія"]	1014
Надія Поліщук	44	["рецептивна естетика", "читацькі дослідження", "інтерпретація"]	151
Надія Словотенко	21	["технічна мінералогія", "природні будматеріали", "коефіцієнт корисної дії"]	463
Надія Хоча	29	["комп'ютерний облік", "автоматизація обліку", "облікові програми"]	103
Назар Бобечко	116	["кримінальний процес", "кримінальне судочинство", "кримінально-процесуальне право"]	382
Назар Васьків	50	["історія міжнародних відносин", "дипломатична історія", "зовнішня політика"]	653
Назар Фтомін	98	["квантова механіка", "квантова фізика", "атомна фізика"]	994
Назарій Походило	112	["фармацевтична хімія", "хімія ліків", "медична хімія"]	1309
Наталя Король	108	["етнокультурологія", "народна культура", "етнічні традиції"]	1049
Наталя Моркун	33	["комп'ютерні системи", "архітектура комп'ютерів", "обчислювальна техніка"]	107
Наталя Нера	41	["креативне письмо", "художній переклад", "літературна творчість"]	136
Наталя Паламар	46	["переклад кіно", "аудіовізуальний переклад", "субтитрування"]	642
Наталія Івасько	85	["JavaScript", "Node.js", "React"]	281
Наталія Барабаш	117	["житлове право", "житлові відносини", "житлове законодавство"]	390
Наталія Боймук	59	["сценічний грим", "гримова справа", "сценічний образ"]	695
Наталія Вінарчук	78	["методика навчання математики", "математична освіта", "розвиток логічного мислення"]	915
Наталія Гаврилова	96	["фізика галактик", "структура галактик", "динаміка галактик"]	986
Наталія Гарасим	1	["біофізика полімерів", "фізичні методи дослідження біомолекул"]	26
Наталія Голуб	4	["генетика мікроорганізмів", "біотехнологія"]	35
Наталія Горук	77	["педагогічні технології", "інновації в освіті", "сучасні методики"]	250
Наталія Горін	71	["міжнародна логістика", "транспортні системи", "постачання"]	738
Наталія Гребінь	107	["психологічне консультування", "консультативна психологія", "психологічна підтримка"]	1040
Наталія Грущинська	118	["медичне право", "лікарська відповідальність", "медичні послуги"]	1360
Наталія Данилевич	28	["операційний менеджмент", "логістика", "управління ланцюгами поставок"]	476
Наталія Данилиха	58	["менеджмент культурних проектів", "організація заходів", "event-менеджмент"]	689
Наталія Дацків	24	["економічне прогнозування", "часові ряди", "прогнозні моделі"]	73
Наталія Демчук	45	["іспанська література", "латиноамериканська література", "література Іспанії"]	630
Наталія Джура	9	["екологія рослин", "фітоіндикація"]	39
Наталія Дядюх-Богатько	58	["маркетинг у культурі", "культурний маркетинг", "просування мистецтва"]	690
Наталія Квіт	118	["право інтелектуальної власності", "авторське право", "патентне право"]	397
Наталія Ковалиско	55	["соціальні дослідження", "методологія соціології", "соціологічні методи"]	644
Наталія Лобода	91	["податковий облік", "податкове планування", "податкове законодавство"]	967
Наталія Максимишин	116	["дактилоскопія", "відбитки пальців", "ідентифікація особи"]	386
Наталія Матійців	4	["генетична інженерія", "методи рекомбінантних ДНК"]	416
Наталія Мачинська	78	["дошкільна педагогіка", "дошкільна освіта", "розвиток дитини"]	253
Наталія Муць	113	["хімія високомолекулярних сполук", "неорганічні полімери", "макромолекули"]	1315
Наталія Пак	90	["економіка транспорту", "транспортна інфраструктура", "логістика"]	964
Наталія Паславська	114	["бюджетне право", "бюджетний процес", "бюджетні відносини"]	1321
Наталія Петращук	43	["німецька мова", "германістика", "німецька філологія"]	615
Наталія Радковець	20	["палеонтологія", "палеобіологія", "еволюція органічного світу"]	457
Наталія Савка	30	["бізнес-статистика", "аналіз ринку", "маркетингові дослідження"]	1375
Наталія Сибірна	2	["ензимологія", "кінетика ферментативних реакцій"]	28
Наталія Ситник	94	["фінансовий менеджмент", "управління фінансами", "корпоративні фінанси"]	972
Наталія Сорока	76	["міграційне право ЄС", "азільне право", "вільне пересування"]	231
Наталія Струк	29	["податковий облік", "податкове планування", "податкове законодавство"]	484
Наталія Стручок	75	["міжнародні розрахунки", "платіжні системи", "валютні операції"]	247
Наталія Сущик	66	["теорія потенціалу", "гармонійні функції", "субгармонійні функції"]	714
Наталія Турмис	50	["історія холодної війни", "біполярна система", "міжнародні конфлікти"]	655
Наталія Хлібороб	114	["енергетичне право", "енергетичне регулювання", "енергетична безпека"]	1323
Наталія Черниш	55	["соціальна стратифікація", "соціальна нерівність", "класові дослідження"]	645
Наталія Шалєнна	75	["фінансова політика", "монетарна політика", "фіскальна політика"]	904
Наталія Яджак	68	["обчислювальна механіка", "МКЕ", "чисельне моделювання"]	200
Наталія Янюк	114	["екологічне право", "екологічне регулювання", "охорона довкілля"]	1324
Оксана Бабелюк	44	["теорія літератури", "літературна критика", "методологія"]	148
Оксана Величко	56	["історія музики", "музикознавство", "музична критика"]	191
Оксана Вільчинська	30	["багатовимірний аналіз", "факторний аналіз", "кластерний аналіз"]	1372
Оксана Гнатина	5	["теріологія", "фауністика"]	421
Оксана Гнаткович	58	["арт-менеджмент", "менеджмент у мистецтві", "галерейна справа"]	688
Оксана Гнатів	118	["банкрутне право", "неспроможність", "санація"]	424
Оксана Головата	66	["гармонійний аналіз", "ряди Фур'є", "перетворення Фур'є"]	201
Оксана Головко-Гавришева	76	["конкурентне право ЄС", "антимонопольне право", "державна допомога"]	725
Оксана Гураль	41	["методика викладання англійської мови", "педагогіка", "дидактика"]	600
Оксана Гірник	117	["право соціального страхування", "соціальне страхування", "страхові виплати"]	1343
Оксана Дарморіз	108	["література та культура", "літературна культура", "культурний контекст"]	1047
Оксана Жук	28	["міжнародний менеджмент", "крос-культурний менеджмент", "глобальний бізнес"]	95
Оксана Жумік	69	["диференціальна геометрія", "тензорний аналіз", "ріманова геометрія"]	222
Оксана Заремба	113	["хімія поверхні", "поверхневі явища", "адсорбція"]	370
Оксана Західна	94	["управління вартістю", "value based management", "акціонерна вартість"]	977
Оксана Зелінська	113	["хімія наноматеріалів", "нанохімія", "наночастинки"]	1314
Оксана Калужна	116	["трасологія", "слідознавство", "дослідження слідів"]	385
Оксана Клювак	24	["веб-аналітика", "електронна комерція", "цифрова економіка"]	467
Оксана Ковалишин	77	["педагогічна комунікація", "вербальна комунікація", "невербальна комунікація"]	252
Оксана Конопельник	98	["оптика", "хвильова оптика", "геометрична оптика"]	320
Оксана Король	56	["камерна музика", "ансамблева практика", "інструментальний ансамбль"]	665
Оксана Лань	57	["класичний танець", "балет", "балетна педагогіка"]	670
Оксана Лозинська	101	["польська мова", "польська філологія", "слов'янські мови"]	1002
Оксана Марець	30	["ймовірність", "математична статистика", "вибірковий метод"]	76
Оксана Нагорнюк	90	["економіка соціальної сфери", "соціальна політика", "соціальні послуги"]	289
Оксана Сенишин	28	["управління проектами", "PMBOK", "agile-менеджмент"]	473
Оксана Склярська	10	["туризмознавство", "рекреаційна географія", "краєзнавство"]	51
Оксана Смеречинська	46	["технічний переклад", "спеціалізовані тексти", "термінологія"]	161
Оксана Стасів	117	["соціальний діалог", "соціальне партнерство", "колективні переговори"]	1348
Оксана Стельмах	96	["астрофізичне моделювання", "чисельне моделювання", "комп'ютерна астрофізика"]	988
Оксана Холявка	67	["непараметрична статистика", "ядерні оцінки", "згладжування"]	197
Оксана Шурко	106	["економічна політика", "політична економія", "економічні аспекти політики"]	1034
Оксана Ярова	67	["багатовимірний аналіз", "факторний аналіз", "кластерний аналіз"]	707
Олег Іванець	5	["іхтіологія", "морфологія тварин"]	422
Олег Ільницький	114	["валютне право", "валютне регулювання", "валютні операції"]	1320
Олег Антоняк	97	["ядерна фізика", "фізика ядра", "радіоактивність"]	308
Олег Бугрій	35	["проектний менеджмент", "управління IT-проектами", "гібкі методології"]	113
Олег Гайовський	18	["геологія родовищ", "металогенія", "мінералогія"]	63
Олег Гутік	89	["безпека IoT", "захист інтернету речей", "кіберфізичні системи"]	272
Олег Демків	55	["політична соціологія", "соціологія влади", "політичні інститути"]	175
Олег Дудяк	48	["археографія", "джерелознавство", "текстологія"]	659
Олег Дух	48	["історична бібліографія", "бібліографічні дослідження", "архівний пошук"]	188
Олег Жук	90	["економіка охорони здоров'я", "медична економіка", "фінансування охорони здоров'я"]	288
Олег Крупич	32	["лазерна техніка", "квантова електроніка", "оптичні прилади"]	78
Олег Кузик	57	["народний танець", "етнохореографія", "традиційна хореографія"]	669
Олег Кушнір	32	["оптоелектроніка", "оптичні системи", "фотоніка"]	77
Олег Лихач	56	["фортепіано", "клавішні інструменти", "концертмейстерство"]	1388
Олег Петрик	57	["театральна педагогіка", "акторська педагогіка", "мистецька освіта"]	668
Олег Романчук	40	["журналістська етика", "професійні стандарти", "саморегулювання"]	594
Олег Романів	60	["теорія кодування", "алгебраїчні коди", "коректуючі коди"]	722
Олег Скасків	66	["комплексний аналіз", "теорія функцій комплексної змінної", "конформні відображення"]	710
Олег Сінькевич	33	["цифрова обробка сигналів", "DSP", "цифрові фільтри"]	572
Олег Ярема	95	["цифрова трансформація", "трансформація бізнесу", "інновації"]	983
Олександр Андрейків	68	["теоретична механіка", "динаміка", "кінематика"]	67
Олександр Вовк	85	["Python", "Django", "Flask"]	279
Олександр Клековкін	59	["театральна педагогіка", "акторська педагогіка", "мистецька освіта"]	694
Олександр Костюк	21	["геохімія", "аналітична хімія", "ізотопна геохімія"]	84
Олександр Кундицький	28	["стратегічний менеджмент", "корпоративне управління", "організаційна поведінка"]	92
Олександр Кучик	75	["міжнародний економічний аналіз", "глобальна економіка", "економічне прогнозування"]	746
Олександр Максимук	69	["лінійна алгебра", "аналітична геометрія", "векторний аналіз"]	221
Олександр Моторний	102	["діалектологія слов'янських мов", "слов'янські діалекти", "регіональні варіанти"]	332
Олександр Плахотнюк	57	["сценічна мова", "сценічна промова", "ораторське мистецтво"]	671
Олександр Тимошук	111	["атомно-абсорбційна спектроскопія", "ААС", "атомна спектроскопія"]	364
Олександр Целуйко	48	["давня історія України", "середньовічна історія", "історія Київської Руси"]	185
Олександра Бонковська	59	["акторська майстерність", "сценічна гра", "акторська техніка"]	692
Олександра Білан	78	["дитяча психологія", "психологія розвитку", "вікова психологія"]	254
Олександра Гірна	89	["управління ризиками", "оцінка ризиків", "ризик-менеджмент"]	942
Олександра Дейчаківська	41	["компаративістика", "порівняльне літературознавство", "міжкультурна комунікація"]	601
Олексій Вінниченко	48	["історична географія", "топоніміка", "краєзнавство"]	658
Олексій Караманов	77	["педагогіка вищої школи", "вища освіта", "університетська педагогіка"]	905
Олексій Ковалюк	29	["управлінський облік", "калькуляція собівартості", "бюджетування"]	97
Олексій Кушнір	34	["комп'ютерні технології", "алгоритми", "програмування"]	1385
Олексій Мороз	75	["фінансова безпека", "фінансові ризики", "фінансові кризи"]	903
Олексій Павлюк	113	["хімія напівметалів", "напівметали", "елементи групи"]	1316
Олексій Сафроняк	42	["епіграфіка", "нумізматика", "археологія"]	142
Олена Абрамюк	107	["експериментальна психологія", "психологічні дослідження", "методологія"]	1038
Олена Баша	59	["театрознавство", "історія театру", "театральна критика"]	691
Олена Бориславська	115	["конституційне право", "конституційне право України", "основи конституціоналізму"]	1325
Олена Винокурова	89	["мережева безпека", "захист мереж", "мережеві атаки"]	269
Олена Волошок	107	["психодіагностика", "психологічне тестування", "діагностичні методи"]	1039
Олена Врублевська	27	["міжнародний маркетинг", "глобальні маркетингові стратегії", "експортний маркетинг"]	470
Олена Галян	78	["початкова освіта", "методика навчання молодших школярів", "дидактика"]	913
Олена Гамкало	29	["облік розрахунків", "дебіторська заборгованість", "кредитна політика"]	487
Олена Гринів	60	["універсальна алгебра", "решітки", "булеві алгебри"]	718
Олена Доманська	67	["статистичне моделювання", "регресійний аналіз", "часові ряди"]	25
Олена Дубіль	29	["звітність підприємства", "фінансова звітність", "аналіз звітності"]	489
Олена Крилова	59	["театральна режисура", "сценічна постановка", "драматургія"]	1392
Олена Кульчицька	117	["право на освіту", "освітнє право", "доступ до освіти"]	1344
Олена Лущинська	78	["оцінювання якості освіти", "моніторинг якості", "педагогічна діагностика"]	258
Олена Оленюк	41	["лінгводидактика", "тестування мовної компетенції", "оцінювання"]	608
Олена Рим	117	["медичне право", "охорона здоров'я", "медичне законодавство"]	389
Олена Сайфутдінова	45	["каталонська мова", "баскська мова", "регіональні мови Іспанії"]	635
Олена Стасик	2	["біохімія вітамінів", "біохімія мікроелементів", "нутріціологія"]	411
Олена Сідельник	93	["фінансові технології", "fintech", "фінтех-інновації"]	969
Олена Томенюк	11	["морська геоморфологія", "абразія", "берегові процеси"]	57
Олеся Буряник	17	["гляціологія", "кріологія", "географія полярних регіонів"]	435
Олеся Ладницька	41	["літературна критика", "теорія літератури", "інтерпретація текстів"]	606
Ольга Албул	102	["болгарська мова", "болгарська філологія", "південнослов'янські мови"]	330
Ольга Барановська	41	["лексикологія англійської мови", "фразеологія", "семантика"]	129
Ольга Біланюк	16	["спортивний туризм", "альпінізм", "екстремальний туризм"]	60
Ольга Біляковська	77	["загальна педагогіка", "теорія виховання", "дидактика"]	248
Ольга Вовчак	93	["банківські технології", "цифрові банкінг", "платіжні системи"]	293
Ольга Галюка	78	["мистецька освіта", "художня освіта", "музична освіта"]	916
Ольга Гапа	59	["сценічний рух", "пластична виразність", "фехтування"]	218
Ольга Гринькевич	30	["статистичний аналіз", "обробка даних", "статистичні методи"]	1370
Ольга Жак	111	["кількісний аналіз", "титрування", "гравиметрія"]	1302
Ольга Квасниця	38	["інформаційні агентства", "новинні потоки", "міжнародна інформація"]	120
Ольга Клепанчук	94	["фінансовий контроль", "внутрішній контроль", "контролюючі системи"]	299
Ольга Козаченко	107	["позитивна психологія", "психологія благополуччя", "психологія щастя"]	179
Ольга Коркуна	111	["інструментальний аналіз", "спектроскопія", "хроматографія"]	362
Ольга Кравець	102	["слов'янська література", "порівняльне літературознавство", "слов'янські літератури"]	1013
Ольга Крайник	43	["стилістика німецької мови", "функціональні стилі", "текстологія"]	145
Ольга Кривешко	28	["управління знаннями", "організаційне навчання", "інтелектуальний капітал"]	480
Ольга Курпіль	41	["фонологія", "фонемний аналіз", "просодія"]	135
Ольга Максимів	103	["сходознавство", "азійські студії", "східні мови"]	1016
Ольга Масловська	6	["екологічна мікробіологія", "мікробні біоценози"]	428
Ольга Маєвська	45	["методика викладання французької", "мовна дидактика", "педагогіка"]	155
Ольга Мильо	69	["чисельні методи", "математичне моделювання", "обчислювальна математика"]	223
Ольга Назаренко	42	["візантіністика", "середньовічна грецька", "візантійська література"]	612
Ольга Осередчук	77	["історія педагогіки", "педагогічна думка", "розвиток освіти"]	906
Ольга Пелюшкевич	88	["робототехніка", "автономні системи", "управління роботами"]	932
Ольга Пилипів	42	["історична лінгвістика", "індоєвропеїстика", "порівняльно-історичний метод"]	613
Ольга Попадюк	60	["алгебраїчна теорія чисел", "поля класів", "L-функції"]	721
Ольга Руденко	90	["державна служба", "адміністративна реформа", "бюрократія"]	287
Ольга Сорока	102	["слов'янські мови", "порівняльна слов'янська філологія", "слов'янознавство"]	329
Ольга Столярик	79	["соціальна робота з безпритульними", "вулична соціальна робота", "соціальна адаптація"]	926
Ольга Теленко	74	["міжнародна політична економія", "глобальна економіка", "політична економія"]	735
Ольга Цвілінюк	9	["екологія мікробіологічних систем"]	420
Ольга Чапля	45	["фонетика романських мов", "порівняльна фонетика", "артикуляційна база"]	637
Орест Мищишин	94	["фінансова реструктуризація", "реструктуризація боргів", "санація"]	982
Орест Раневич	117	["міграційне право", "соціальний захист мігрантів", "міграційна політика"]	393
Ореста Баса	104	["текстологія", "видання творів", "критика тексту"]	339
Ореста Бордун	16	["екотуризм", "сталий розвиток туризму", "природоохоронні території"]	445
Ореста Забурянна	103	["китайська мова", "китаїстика", "китайська філологія"]	333
Ореста Лосик	110	["філософія освіти", "освітня філософія", "філософія педагогіки"]	359
Орислава Калиняк	55	["соціологія культури", "культурні дослідження", "соціальна антропологія"]	646
Орися Легка	104	["літературний процес", "літературне життя", "літературні угруповання"]	1026
Остап Решетило	5	["географія тварин", "зоогеографія"]	44
Павло Горішній	11	["гляціальна геоморфологія", "перигляціальні процеси", "кріогенез"]	441
Павло Щепанський	98	["фізика коливань", "хвилі", "резонанс"]	321
Петро Венгерський	89	["кібербезпека", "інформаційна безпека", "захист інформації"]	938
Петро Волошин	19	["інженерна геологія", "механіка ґрунтів", "геотехніка"]	453
Петро Кузик	74	["геополітика", "політична географія", "стратегічні дослідження"]	733
Петро Луньо	57	["театральний менеджмент", "продюсування", "організація вистав"]	213
Петро Манюк	115	["конституційні зміни", "конституційна реформа", "поправки до конституції"]	381
Петро Ридчук	111	["мас-спектрометрія", "мас-спектроскопія", "мас-аналіз"]	363
Петро Якібчук	99	["фазові перетворення", "термічна обробка", "загартування"]	998
Пилип Пилипенко	117	["соціальне право", "право соціального забезпечення", "соціальне законодавство"]	1340
Роксоляна Кохан	46	["лінгвокультурологія", "мовна картина світу", "культурні концепти"]	640
Роксоляна Оліщук	42	["класична традиція", "рецепція античності", "неокласицизм"]	141
Роман Берест	57	["хореографія", "танцювальне мистецтво", "композиція танцю"]	210
Роман Галуйко	108	["театральна культура", "театрознавство", "історія театру"]	352
Роман Гамерник	97	["фізика плазми", "термоядерний синтез", "плазмові технології"]	990
Роман Генега	53	["архівне краєзнавство", "історичні документи", "документальна спадщина"]	189
Роман Гладишевський	113	["неорганічна хімія", "хімія елементів", "неорганічні сполуки"]	1310
Роман Гнатюк	11	["флювіальна геоморфологія", "річкові системи", "алювіальні процеси"]	440
Роман Джох	114	["банківське право", "фінансові інститути", "банківське регулювання"]	1319
Роман Домбровський	42	["палеографія", "екстологія", "рукописна спадщина"]	139
Роман Дреботій	86	["мобільні додатки", "розробка додатків", "UI/UX"]	268
Роман Калитчак	74	["конфліктологія", "мирні дослідження", "вирішення конфліктів"]	235
Роман Крохмальний	104	["поезія", "віршознавство", "поетика"]	337
Роман Лаврентій	59	["сценічна мова", "дикція", "сценічна промова"]	195
Роман Лозинський	10	["географія України", "регіональна географія", "фізико-географічне районування"]	430
Роман Мартяк	112	["органічний синтез", "синтетична хімія", "методи синтезу"]	366
Роман Масик	53	["музейне краєзнавство", "музейна справа", "експозиційна діяльність"]	663
Роман Москалик	71	["міжнародні розрахунки", "валютні операції", "міжнародні платежі"]	739
Роман Одрехівський	57	["сценографія", "художнє оформлення", "декорації"]	211
Роман Олійник	88	["комп'ютерний зір", "обробка зображень", "розпізнавання образів"]	263
Роман Рабош	33	["вбудовані системи", "мікроконтролери", "Internet of Things"]	571
Роман Селіверстов	85	["мобільна розробка", "Android", "iOS"]	284
Роман Стахіра	35	["хмарні технології", "AWS", "Azure"]	118
Роман Сілецький	52	["етнологія", "етнографія", "культурна антропологія"]	649
Роман Тарнавський	52	["етнографічні методи", "польові дослідження", "етнографічна експедиція"]	182
Роман Шандра	114	["транспортне право", "транспортне регулювання", "транспортні перевезення"]	377
Роман Шувар	35	["системний аналіз", "проектування систем", "системна архітектура"]	577
Роман Шуст	48	["палеографія", "екстологія", "історичні джерела"]	186
Романна Малець	85	["тестування ПЗ", "unit testing", "інтеграційне тестування"]	955
Ростислав Гнатюк	22	["міжнародні економічні відносини", "глобалізація", "транснаціональні процеси"]	1364
Ростислав Михайлишин	22	["економіка розвитку", "демографія", "економіка праці"]	466
Ростислав Романишин	34	["фізика твердого тіла", "напівпровідники", "діелектрики"]	576
Ростислав Романюк	74	["міжнародні відносини", "теорія міжнародних відносин", "глобальна політика"]	729
Руслан Бедрій	115	["конституційна юстиція", "конституційний суд", "конституційне судочинство"]	1327
Руслан Брезвін	97	["фізика високих енергій", "прискорювачі частинок", "детектори"]	307
Руслан Кундис	57	["сучасний танець", "модерн-балет", "контемпорарі"]	212
Руслан Сіромський	50	["новітня історія", "історія XX століття", "сучасна історія"]	183
Руслана Каркоська	107	["психологія сім'ї", "сімейна психологія", "сімейні відносини"]	1042
Святослав Зубченко	42	["метрика і просодія", "антична поезія", "версифікація"]	611
Святослав Літинський	85	["архітектура ПЗ", "патерни проектування", "UML"]	282
Святослав Сеник	76	["екологічне право ЄС", "енергетичне право", "сталий розвиток"]	726
Святослав Смєречинський	96	["фізика сонячної системи", "планетологія", "астероїди"]	306
Світлана Івашків-Когут	41	["технічний переклад", "спеціалізовані тексти", "термінологія"]	603
Світлана Була	106	["політичний аналіз", "аналіз політичних процесів", "політичні дослідження"]	1030
Світлана Войтюк	41	["перекладознавство", "теорія перекладу", "практика перекладу"]	599
Світлана Гнатуш	6	["загальна мікробіологія", "фізіологія мікроорганізмів"]	426
Світлана Гончарук	91	["аудит", "внутрішній контроль", "аудиторські процедури"]	291
Світлана Горбулінська	4	["генетика рослин", "селекція"]	36
Світлана Григорук	100	["прагмалінгвістика", "мовленнєві акти", "комунікативна компетенція"]	326
Світлана Квак	30	["регресійний аналіз", "кореляційний аналіз", "економетричні моделі"]	75
Світлана Кость	78	["сімейна педагогіка", "робота з батьками", "сімейне виховання"]	257
Світлана Лозинська	78	["проектна діяльність", "проектні технології", "дослідницька діяльність"]	921
Світлана Маценка	43	["фонетика німецької мови", "артикуляція", "просодія"]	616
Світлана Пик	74	["міжнародне право", "публічне міжнародне право", "дипломатичне право"]	236
Світлана Писаренко	71	["міжнародні фінанси", "міжнародні валютні відносини", "платіжні баланси"]	736
Світлана Приймак	91	["фінансовий облік", "бухгалтерський облік", "МСФЗ"]	965
Світлана Пукас	113	["хімія перехідних металів", "перехідні метали", "d-елементи"]	372
Світлана Салдан	56	["музична педагогіка", "методика викладання", "музична освіта"]	1387
Світлана Синчук	117	["сімейне право", "сімейні відносини", "сімейне законодавство"]	1342
Світлана Урба	25	["економіка України", "національна економіка", "економічний розвиток"]	68
Світлана Шульц	16	["готельний бізнес", "ресторанна справа", "сервіс у туризмі"]	59
Семен Матковський	30	["економічна статистика", "макроекономічні показники", "система національних рахунків"]	74
Сергій Євсеєв	89	["криптографія", "шифрування", "криптоаналіз"]	270
Сергій Вельгош	34	["радіофізика", "електродинаміка", "поширення радіохвиль"]	110
Сергій Рабінович	115	["конституційний лад", "державний устрій", "конституційні принципи"]	378
Сергій Рендзіняк	34	["комп'ютерне моделювання", "чисельні методи", "математичне моделювання"]	1383
Сергій Різник	115	["права людини", "конституційні права", "захист прав людини"]	1326
Сергій Свелеба	32	["оптоелектронні прилади", "фотодетектори", "світлодіоди"]	570
Сергій Ціхонь	18	["гідрогеологія", "інженерна геологія", "геотехніка"]	66
Сергій Ярошко	85	["програмування", "алгоритми та структури даних", "об'єктно-орієнтоване програмування"]	278
Соломія Бук	100	["порівняльно-історичне мовознавство", "етимологія", "діалектологія"]	999
Соломія Кріль	21	["електронна мікроскопія", "рентгеноструктурний аналіз", "мінеральний аналіз"]	462
Соломія Огінок	71	["економічна дипломатія", "торгові угоди", "економічна безпека"]	240
Соломія Онуфрів	40	["регіональна преса", "місцеві ЗМІ", "комунікації в регіонах"]	592
Софія Варецька	44	["американська література", "латиноамериканська література", "постколоніальні дослідження"]	626
Софія Грабовська	107	["загальна психологія", "психологічна наука", "психологічні процеси"]	344
Степан Білостоцький	48	["історіографія", "методологія історії", "історична пам'ять"]	657
Степан Коссак	118	["будівельне право", "будівництво", "будівельні договори"]	425
Степан Кость	40	["історія української преси", "журналістика України", "медіаспадщина"]	591
Степан Мудрий	99	["фізика металів", "металознавство", "структура металів"]	322
Степан Панчишин	22	["макроекономіка", "економічний аналіз", "економічна політика"]	86
Тарас Банах	60	["загальна алгебра", "теорія груп", "теорія кілець"]	715
Тарас Бокало	67	["байєсівська статистика", "байєсівські методи", "байєсівський висновок"]	705
Тарас Брич	89	["безпека веб-додатків", "веб-безпека", "OWASP"]	941
Тарас Демків	98	["електродинаміка", "електрика", "магнетизм"]	993
Тарас Заболоцький	85	["Java", "Spring", "Hibernate"]	952
Тарас Кудрик	66	["теорія наближень", "ортогональні поліноми", "сплайни"]	202
Тарас Лильо	38	["медіасистеми світу", "порівняльна журналістика", "медіадослідження"]	585
Тарас Малий	97	["оптика", "лазерна фізика", "нелінійна оптика"]	991
Тарас Ненчук	35	["штучний інтелект", "машинне навчання", "обробка природної мови"]	583
Тарас Панчишин	30	["програмне забезпечення для статистики", "R", "Python"]	1374
Тарас Пастух	104	["літературна критика", "критичний аналіз", "інтерпретація текстів"]	336
Тарас Перетятко	6	["генетика бактерій", "мікробна біотехнологія"]	48
Тарас Пиц	43	["бізнес-німецька", "професійна комунікація", "кореспонденція"]	147
Тарас Радул	60	["теорія чисел", "алгебраїчна теорія чисел", "аналітична теорія чисел"]	205
Тарас Рим	118	["екологічне право", "природоохоронне право", "екологічне законодавство"]	1354
Тетяна Єщенко	100	["структурна лінгвістика", "фонологія", "морфологія"]	325
Тетяна Бублик	41	["стилістика англійської мови", "функціональні стилі", "дискурс-аналіз"]	130
Тетяна Власевич	56	["композиція", "музична творчість", "аранжування"]	1046
Тетяна Каспрук	59	["режисура театру", "сценічна постановка", "драматургія вистави"]	693
Тетяна Лапан	55	["соціологія сім'ї", "сімейні дослідження", "гендерна соціологія"]	180
Тетяна Ляшенко	46	["міжмовна комунікація", "інтерлінгвістика", "поліглотія"]	160
Тетяна Марусяк	55	["урбаністична соціологія", "соціологія міста", "міські дослідження"]	648
Тетяна Мідяна	43	["методика викладання німецької", "мовна дидактика", "педагогіка"]	146
Тетяна Оршинська	41	["переклад кіно", "аудіовізуальний переклад", "субтитрування"]	137
Тетяна Парпан	117	["боротьба з безробіттям", "ринок праці", "зайнятість населення"]	1347
Тетяна Партико	107	["організаційна психологія", "психологія праці", "управління персоналом"]	1037
Тетяна Слотюк	40	["медіаосвіта", "журналістська освіта", "підготовка кадрів"]	127
Тетяна Соляр	85	["функціональне програмування", "Haskell", "Scala"]	285
Тетяна Хоменко	38	["інформаційна безпека", "медіаправо", "етика міжнародної журналістики"]	587
Тетяна Яворська	27	["бренд-менеджмент", "позиціювання", "стратегічний маркетинг"]	468
Уляна Євчук	101	["польська література", "літературознавство", "критика"]	1004
Уляна Андрусів	118	["право власності", "речові права", "правомочності власника"]	400
Уляна Борняк	21	["петрографія", "магматичні породи", "метаморфічні породи"]	461
Уляна Ватаманюк-Зелінська	94	["управління грошовими потоками", "керування ліквідністю", "касові плани"]	973
Уляна Грудзевич	93	["інвестиційні технології", "робо-рада", "алгоритмічний трейдинг"]	971
Уляна Зьомко	41	["бізнес-англійська", "професійна комунікація", "кореспонденція"]	133
Уляна Левко	101	["польська культура", "країнознавство Польщі", "культурологія"]	1005
Уляна Хамар	105	["середньовічна філософія", "схоластика", "патристика"]	340
Федір Стригун	57	["режисура", "сценічна постановка", "драматургія"]	666
Флорій Бацевич	100	["загальне мовознавство", "лінгвістика", "теорія мови"]	324
Христина Дацишин	39	["журналістські жанри", "новинна журналістика", "репортаж"]	588
Христина Демків	29	["облік витрат", "класифікація витрат", "центри відповідальності"]	488
Христина Дяків	46	["теорія перекладу", "перекладознавство", "методологія перекладу"]	158
Христина Калагурка	77	["педагогічна антропологія", "філософська антропологія", "людинознавство"]	910
Христина Куйбіда	42	["неолатинська література", "відродження", "гуманізм"]	140
Христина Кунець	41	["психолінгвістика", "когнітивна лінгвістика", "мовленнєва діяльність"]	605
Христина Лесько	45	["французька культура", "країнознавство Франції", "франкофонія"]	154
Христина Назаркевич	43	["австрійська література", "швейцарська література", "регіональні літератури"]	620
Христина Ніколайчук	101	["історія польської мови", "етимологія", "діалектологія"]	1006
Христина Стельмах	101	["методика викладання польської", "мовна дидактика", "педагогіка"]	328
Христина Чопко	117	["антидискримінаційне право", "боротьба з дискримінацією", "рівні права"]	1350
Юліан Бек	118	["зобов'язальне право", "договірне право", "цивільні зобов'язання"]	1358
Юлія Бєлозьорова	43	["лексикологія німецької мови", "словниковий запас", "термінологія"]	617
Юлія Дацько	41	["американська література", "британська література", "літературознавство"]	131
Юлія Денисяк	78	["мовленнєвий розвиток", "розвиток мовлення", "комунікативні навички"]	917
Юлія Деркач	78	["соціальний розвиток", "соціалізація", "емоційний інтелект"]	918
Юлія Заячук	77	["педагогічна майстерність", "педагогічне мистецтво", "викладацька діяльність"]	909
Юлія Зелена	45	["порівняльна романістика", "романські мови", "контрастивна лінгвістика"]	153
Юлія Зіньцо	27	["соціальний маркетинг", "маркетинг ідей", "корпоративна соціальна відповідальність"]	472
Юлія Микитюк	43	["переклад з німецької", "перекладознавство", "практика перекладу"]	619
Юлія Сліпецька	106	["політична психологія", "психологія політики", "політична поведінка"]	343
Юлія Стефанишин	101	["польсько-українські літературні зв'язки", "компаративістика", "міжлітературні контакти"]	1007
Юлія Утко-Масляник	76	["фінансове право ЄС", "банківське право ЄС", "фіскальна політика"]	727
Юлія Шушкова	94	["управління ризиками", "ризик-менеджмент", "фінансові ризики"]	974
Юрій Іщук	60	["теорія представлень", "групи Лі", "алгебри Лі"]	207
Юрій Віхоть	18	["нафтова геологія", "газова геологія", "петрологія"]	64
Юрій Голинський	94	["фінансове планування", "бюджетування", "фінансові прогнози"]	297
Юрій Головатий	67	["математична статистика", "статистичний аналіз", "вибіркові методи"]	702
Юрій Горблянський	104	["література діаспори", "еміграційна література", "зарубіжна україністика"]	1024
Юрій Гудима	48	["спеціальні історичні дисципліни", "нумізматика", "сфрагістика"]	187
Юрій Жук	16	["транспорт у туризмі", "логістика туристичних потоків", "авіаперевезення"]	447
Юрій Завгороднєв	41	["академічне письмо", "науковий стиль", "академічна комунікація"]	602
Юрій Захаров	43	["історія німецької мови", "діалектологія", "етимологія"]	144
Юрій Крупський	19	["гідрогеологія", "водозабезпечення", "оцінка водних ресурсів"]	454
Юрій Кулініч	96	["екзопланети", "планетні системи", "пошук екзопланет"]	987
Юрій Мельник	38	["іноземна преса", "контент-аналіз", "медіатексти"]	121
Юрій Мороз	74	["зовнішня політика", "аналіз зовнішньої політики", "політичний аналіз"]	234
Юрій Остап'юк	112	["хімія природних сполук", "біоорганічна хімія", "природні речовини"]	1308
Юрій Пачковський	55	["загальна соціологія", "соціологічна теорія", "історія соціології"]	174
Юрій Плевачук	99	["механічні властивості металів", "міцність", "пластичність"]	996
Юрій Присяжнюк	74	["міжнародні організації", "ООН", "регіональні організації"]	731
Юрій Раделицький	29	["фінансовий облік", "міжнародні стандарти фінансової звітності", "бухгалтерський облік"]	482
Юрій Сибіль	85	["DevOps", "CI/CD", "контейнеризація"]	956
Юрій Сливка	113	["хімія твердого тіла", "твердотільна хімія", "кристалохімія"]	369
Юрій Теребушко	43	["німецька культура", "країнознавство", "міжкультурна комунікація"]	621
Юрій Токовий	83	["математична фізика", "диференціальні рівняння", "обчислювальна фізика"]	947
Юрій Трухан	66	["квазіконформні відображення", "геометрична теорія функцій", "тейхмюлерові простори"]	204
Юрій Чеков	59	["сценографія", "художнє оформлення", "декорації"]	1394
Юрій Щербина	88	["теорія графів", "алгоритми на графах", "мережеві моделі"]	928
Юрій Юркевич	118	["адвокатура", "адвокатська діяльність", "захист прав"]	399
Юрій Ящук	83	["прикладна математика", "математичне моделювання", "чисельні методи"]	274
Юрій-Антоній Зборівський	118	["споживче право", "захист споживачів", "споживчі права"]	1361
Ярема Кравець	44	["модернізм", "постмодернізм", "сучасна література"]	150
Ярина Коковська	88	["машинне навчання", "нейронні мережі", "глибоке навчання"]	930
Ярина Колісник	6	["промислова мікробіологія", "біотехнологія"]	47
Ярина Стецько	45	["квебекська література", "франкомовна література Канади", "регіональні літератури"]	156
Ярина Танчак	79	["соціальний супровід", "академічний супровід", "психологічний супровід"]	927
Ярина Тузяк	20	["палеоекологія", "тафономія", "біостратиграфія"]	82
Ярина Шалай	1	["біоінформатика", "аналіз геномів", "аналіз протеомів", "машинне навчання в біології"]	407
Ярослав Єлейко	67	["випадкові процеси", "марковські процеси", "пуассонівські процеси"]	703
Ярослав Береський	116	["кримінальна поліція", "розслідування злочинів", "оперативно-розшукова діяльність"]	1334
Ярослав Бойко	33	["системне програмування", "операційні системи", "низькорівневе програмування"]	1382
Ярослав Бордян	79	["соціальна робота з молоддю", "молодіжна робота", "молодіжні організації"]	259
Ярослав Гринчишин	94	["управління капіталом", "структура капіталу", "вартість капіталу"]	975
Ярослав Каличак	111	["якісний аналіз", "ідентифікація речовин", "качественні реакції"]	361
Ярослав Конопля	90	["економіка освіти", "фінансування освіти", "освітня політика"]	962
Ярослав Микитюк	66	["аналітична теорія чисел", "дзета-функція", "L-функції"]	713
Ярослав Притула	66	["спеціальні функції", "гіпергеометричні функції", "функції Бесселя"]	203
Ярослав Соколовський	86	["корпоративні інформаційні системи", "ERP", "CRM"]	934
Ярослав Чорнодолський	98	["статистична фізика", "термодинаміка", "молекулярна фізика"]	995
Ярослав Ярема	91	["фінансовий аналіз", "аналіз звітності", "фінансові показники"]	966
Ярослава Ломницька	111	["електрохімічні методи", "потенціометрія", "кондуктометрія"]	1303
\.


--
-- Data for Name: user_chapters; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.user_chapters (id, user_id, project_type, chapter_key, progress, status, student_note, uploaded_file_name, uploaded_file_date, uploaded_file_size, updated_at, created_at, title, submitted_for_review_at, graded_by, graded_at, project_title, supervisor, project_start_date, project_deadline, application_id, work_type) FROM stdin;
264	21	coursework	sources	0	pending		\N	\N	\N	2025-11-04 13:23:51.135111	2025-11-04 13:23:51.135111	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
265	21	coursework	appendix	0	pending		\N	\N	\N	2025-11-04 13:23:51.136013	2025-11-04 13:23:51.136013	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
266	21	coursework	cover	0	pending		\N	\N	\N	2025-11-04 13:23:51.136799	2025-11-04 13:23:51.136799	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
211	21	diploma	intro	0	pending		\N	\N	\N	2025-10-12 12:40:52.632635	2025-10-12 12:40:52.632635	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
267	21	coursework	content	0	pending		\N	\N	\N	2025-11-04 13:23:51.137574	2025-11-04 13:23:51.137574	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
261	21	coursework	theory	70	review		websocket-server.ts	2025-11-04 13:55:25.699	17 KB	2025-11-04 13:55:25.700348	2025-11-04 13:23:51.132594	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
370	266	coursework	intro	0	pending		\N	\N	\N	2025-11-23 00:17:33.611876	2025-11-23 00:17:33.611876	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
263	21	coursework	conclusion	70	review		db.js	2025-11-04 13:55:31.455	0 KB	2025-11-04 13:55:31.456324	2025-11-04 13:23:51.134293	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
371	266	coursework	theory	0	pending		\N	\N	\N	2025-11-23 00:17:33.616098	2025-11-23 00:17:33.616098	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
262	21	coursework	design	70	review		StudentApplications.tsx	2025-11-18 17:13:43.104	55 KB	2025-11-18 17:13:43.105201	2025-11-04 13:23:51.133394	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
260	21	coursework	intro	70	review		Calendar.tsx	2025-11-18 17:13:54.911	32 KB	2025-11-18 17:13:54.923004	2025-11-04 13:23:51.130088	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
372	266	coursework	design	0	pending		\N	\N	\N	2025-11-23 00:17:33.61733	2025-11-23 00:17:33.61733	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
285	1378	diploma	intro	0	pending		\N	\N	\N	2025-11-09 17:59:05.543871	2025-11-09 17:59:05.543871	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
286	1378	diploma	theory	0	pending		\N	\N	\N	2025-11-09 17:59:05.548018	2025-11-09 17:59:05.548018	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
288	1378	diploma	design	0	pending		\N	\N	\N	2025-11-09 17:59:05.549659	2025-11-09 17:59:05.549659	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
290	1378	diploma	implementation	0	pending		\N	\N	\N	2025-11-09 17:59:05.550406	2025-11-09 17:59:05.550406	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
292	1378	diploma	conclusion	0	pending		\N	\N	\N	2025-11-09 17:59:05.550983	2025-11-09 17:59:05.550983	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
294	1378	diploma	sources	0	pending		\N	\N	\N	2025-11-09 17:59:05.551579	2025-11-09 17:59:05.551579	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
296	1378	diploma	appendix	0	pending		\N	\N	\N	2025-11-09 17:59:05.552133	2025-11-09 17:59:05.552133	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
298	1378	diploma	abstract	0	pending		\N	\N	\N	2025-11-09 17:59:05.55268	2025-11-09 17:59:05.55268	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
300	1378	diploma	cover	0	pending		\N	\N	\N	2025-11-09 17:59:05.553771	2025-11-09 17:59:05.553771	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
302	1378	diploma	content	0	pending		\N	\N	\N	2025-11-09 17:59:05.554534	2025-11-09 17:59:05.554534	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
373	266	coursework	conclusion	0	pending		\N	\N	\N	2025-11-23 00:17:33.617826	2025-11-23 00:17:33.617826	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
312	1396	coursework	intro	0	pending		\N	\N	\N	2025-11-13 00:55:12.091511	2025-11-10 12:56:58.539429	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
313	1396	coursework	theory	0	pending		\N	\N	\N	2025-11-13 00:55:13.092885	2025-11-10 12:56:58.540345	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
320	571	coursework	intro	0	pending		\N	\N	\N	2025-11-13 22:20:06.916525	2025-11-13 22:20:06.916525	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
321	571	coursework	theory	0	pending		\N	\N	\N	2025-11-13 22:20:06.921053	2025-11-13 22:20:06.921053	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
322	571	coursework	design	0	pending		\N	\N	\N	2025-11-13 22:20:06.921429	2025-11-13 22:20:06.921429	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
323	571	coursework	conclusion	0	pending		\N	\N	\N	2025-11-13 22:20:06.921786	2025-11-13 22:20:06.921786	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
324	571	coursework	sources	0	pending		\N	\N	\N	2025-11-13 22:20:06.922297	2025-11-13 22:20:06.922297	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
325	571	coursework	appendix	0	pending		\N	\N	\N	2025-11-13 22:20:06.923091	2025-11-13 22:20:06.923091	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
326	571	coursework	cover	0	pending		\N	\N	\N	2025-11-13 22:20:06.923806	2025-11-13 22:20:06.923806	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
327	571	coursework	content	0	pending		\N	\N	\N	2025-11-13 22:20:06.924604	2025-11-13 22:20:06.924604	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
336	1396	diploma	intro	0	pending		\N	\N	\N	2025-11-15 22:58:14.902543	2025-11-15 22:58:14.902543	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
337	1396	diploma	theory	0	pending		\N	\N	\N	2025-11-15 22:58:14.907306	2025-11-15 22:58:14.907306	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
338	1396	diploma	design	0	pending		\N	\N	\N	2025-11-15 22:58:14.907951	2025-11-15 22:58:14.907951	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
339	1396	diploma	implementation	0	pending		\N	\N	\N	2025-11-15 22:58:14.90865	2025-11-15 22:58:14.90865	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
340	1396	diploma	conclusion	0	pending		\N	\N	\N	2025-11-15 22:58:14.909147	2025-11-15 22:58:14.909147	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
341	1396	diploma	sources	0	pending		\N	\N	\N	2025-11-15 22:58:14.909845	2025-11-15 22:58:14.909845	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
342	1396	diploma	appendix	0	pending		\N	\N	\N	2025-11-15 22:58:14.910382	2025-11-15 22:58:14.910382	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
343	1396	diploma	abstract	0	pending		\N	\N	\N	2025-11-15 22:58:14.910856	2025-11-15 22:58:14.910856	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
344	1396	diploma	cover	0	pending		\N	\N	\N	2025-11-15 22:58:14.911919	2025-11-15 22:58:14.911919	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
314	1396	coursework	design	0	pending		\N	\N	\N	2025-11-10 12:56:58.54107	2025-11-10 12:56:58.54107	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
315	1396	coursework	conclusion	0	pending		\N	\N	\N	2025-11-10 12:56:58.541791	2025-11-10 12:56:58.541791	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
316	1396	coursework	sources	0	pending		\N	\N	\N	2025-11-10 12:56:58.542523	2025-11-10 12:56:58.542523	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
317	1396	coursework	appendix	0	pending		\N	\N	\N	2025-11-10 12:56:58.543661	2025-11-10 12:56:58.543661	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
318	1396	coursework	cover	0	pending		\N	\N	\N	2025-11-10 12:56:58.54457	2025-11-10 12:56:58.54457	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
319	1396	coursework	content	0	pending		\N	\N	\N	2025-11-10 12:56:58.545426	2025-11-10 12:56:58.545426	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
374	266	coursework	sources	0	pending		\N	\N	\N	2025-11-23 00:17:33.618214	2025-11-23 00:17:33.618214	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
345	1396	diploma	content	0	pending		\N	\N	\N	2025-11-15 22:58:14.912682	2025-11-15 22:58:14.912682	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
346	283	coursework	intro	0	pending		\N	\N	\N	2025-11-17 01:12:25.137653	2025-11-17 01:12:25.137653	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
347	283	coursework	theory	0	pending		\N	\N	\N	2025-11-17 01:12:25.140497	2025-11-17 01:12:25.140497	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
348	283	coursework	design	0	pending		\N	\N	\N	2025-11-17 01:12:25.141292	2025-11-17 01:12:25.141292	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
349	283	coursework	conclusion	0	pending		\N	\N	\N	2025-11-17 01:12:25.142073	2025-11-17 01:12:25.142073	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
350	283	coursework	sources	0	pending		\N	\N	\N	2025-11-17 01:12:25.142805	2025-11-17 01:12:25.142805	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
351	283	coursework	appendix	0	pending		\N	\N	\N	2025-11-17 01:12:25.143378	2025-11-17 01:12:25.143378	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
352	283	coursework	cover	0	pending		\N	\N	\N	2025-11-17 01:12:25.143885	2025-11-17 01:12:25.143885	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
353	283	coursework	content	0	pending		\N	\N	\N	2025-11-17 01:12:25.144448	2025-11-17 01:12:25.144448	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
362	946	coursework	intro	0	pending		\N	\N	\N	2025-11-18 17:12:34.664305	2025-11-18 17:12:34.664305	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
363	946	coursework	theory	0	pending		\N	\N	\N	2025-11-18 17:12:34.679331	2025-11-18 17:12:34.679331	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
364	946	coursework	design	0	pending		\N	\N	\N	2025-11-18 17:12:34.680329	2025-11-18 17:12:34.680329	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
365	946	coursework	conclusion	0	pending		\N	\N	\N	2025-11-18 17:12:34.681226	2025-11-18 17:12:34.681226	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
366	946	coursework	sources	0	pending		\N	\N	\N	2025-11-18 17:12:34.682138	2025-11-18 17:12:34.682138	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
367	946	coursework	appendix	0	pending		\N	\N	\N	2025-11-18 17:12:34.683132	2025-11-18 17:12:34.683132	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
368	946	coursework	cover	0	pending		\N	\N	\N	2025-11-18 17:12:34.684069	2025-11-18 17:12:34.684069	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
369	946	coursework	content	0	pending		\N	\N	\N	2025-11-18 17:12:34.684839	2025-11-18 17:12:34.684839	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
375	266	coursework	appendix	0	pending		\N	\N	\N	2025-11-23 00:17:33.618761	2025-11-23 00:17:33.618761	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
376	266	coursework	cover	0	pending		\N	\N	\N	2025-11-23 00:17:33.619578	2025-11-23 00:17:33.619578	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
377	266	coursework	content	0	pending		\N	\N	\N	2025-11-23 00:17:33.620379	2025-11-23 00:17:33.620379	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
395	1404	diploma	cover	0	pending		\N	\N	\N	2025-11-29 13:01:05.064471	2025-11-29 13:01:05.064471	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
396	1404	diploma	content	0	pending		\N	\N	\N	2025-11-29 13:01:05.066333	2025-11-29 13:01:05.066333	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
398	1405	diploma	intro	0	pending		\N	\N	\N	2025-11-29 13:19:31.872676	2025-11-29 13:19:31.872676	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
400	1405	diploma	theory	0	pending		\N	\N	\N	2025-11-29 13:19:31.874479	2025-11-29 13:19:31.874479	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
402	1405	diploma	design	0	pending		\N	\N	\N	2025-11-29 13:19:31.875219	2025-11-29 13:19:31.875219	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
404	1405	diploma	implementation	0	pending		\N	\N	\N	2025-11-29 13:19:31.875896	2025-11-29 13:19:31.875896	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
406	1405	diploma	conclusion	0	pending		\N	\N	\N	2025-11-29 13:19:31.876615	2025-11-29 13:19:31.876615	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
408	1405	diploma	sources	0	pending		\N	\N	\N	2025-11-29 13:19:31.877239	2025-11-29 13:19:31.877239	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
410	1405	diploma	appendix	0	pending		\N	\N	\N	2025-11-29 13:19:31.877807	2025-11-29 13:19:31.877807	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
412	1405	diploma	abstract	0	pending		\N	\N	\N	2025-11-29 13:19:31.878466	2025-11-29 13:19:31.878466	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
414	1405	diploma	cover	0	pending		\N	\N	\N	2025-11-29 13:19:31.879109	2025-11-29 13:19:31.879109	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
416	1405	diploma	content	0	pending		\N	\N	\N	2025-11-29 13:19:31.879738	2025-11-29 13:19:31.879738	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
212	21	diploma	theory	0	pending		\N	\N	\N	2025-10-12 12:40:52.637652	2025-10-12 12:40:52.637652	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
213	21	diploma	design	0	pending		\N	\N	\N	2025-10-12 12:40:52.638483	2025-10-12 12:40:52.638483	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
214	21	diploma	implementation	0	pending		\N	\N	\N	2025-10-12 12:40:52.639169	2025-10-12 12:40:52.639169	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
215	21	diploma	conclusion	0	pending		\N	\N	\N	2025-10-12 12:40:52.639796	2025-10-12 12:40:52.639796	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
216	21	diploma	sources	0	pending		\N	\N	\N	2025-10-12 12:40:52.640787	2025-10-12 12:40:52.640787	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
217	21	diploma	appendix	0	pending		\N	\N	\N	2025-10-12 12:40:52.642129	2025-10-12 12:40:52.642129	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
218	21	diploma	abstract	0	pending		\N	\N	\N	2025-10-12 12:40:52.642966	2025-10-12 12:40:52.642966	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
219	21	diploma	cover	0	pending		\N	\N	\N	2025-10-12 12:40:52.643606	2025-10-12 12:40:52.643606	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
220	21	diploma	content	0	pending		\N	\N	\N	2025-10-12 12:40:52.644009	2025-10-12 12:40:52.644009	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
328	1385	coursework	intro	0	pending		\N	\N	\N	2025-11-13 22:50:00.858376	2025-11-13 22:50:00.858376	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
329	1385	coursework	theory	0	pending		\N	\N	\N	2025-11-13 22:50:00.859383	2025-11-13 22:50:00.859383	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
330	1385	coursework	design	0	pending		\N	\N	\N	2025-11-13 22:50:00.860413	2025-11-13 22:50:00.860413	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
331	1385	coursework	conclusion	0	pending		\N	\N	\N	2025-11-13 22:50:00.861315	2025-11-13 22:50:00.861315	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
332	1385	coursework	sources	0	pending		\N	\N	\N	2025-11-13 22:50:00.862093	2025-11-13 22:50:00.862093	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
333	1385	coursework	appendix	0	pending		\N	\N	\N	2025-11-13 22:50:00.862912	2025-11-13 22:50:00.862912	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
334	1385	coursework	cover	0	pending		\N	\N	\N	2025-11-13 22:50:00.863689	2025-11-13 22:50:00.863689	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
335	1385	coursework	content	0	pending		\N	\N	\N	2025-11-13 22:50:00.864318	2025-11-13 22:50:00.864318	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
229	21	practice	intro	0	pending		\N	\N	\N	2025-10-12 12:40:56.395144	2025-10-12 12:40:56.395144	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
230	21	practice	tasks	0	pending		\N	\N	\N	2025-10-12 12:40:56.395674	2025-10-12 12:40:56.395674	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
231	21	practice	diary	0	pending		\N	\N	\N	2025-10-12 12:40:56.396401	2025-10-12 12:40:56.396401	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
232	21	practice	report	0	pending		\N	\N	\N	2025-10-12 12:40:56.39735	2025-10-12 12:40:56.39735	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
233	21	practice	conclusion	0	pending		\N	\N	\N	2025-10-12 12:40:56.39809	2025-10-12 12:40:56.39809	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
234	21	practice	sources	0	pending		\N	\N	\N	2025-10-12 12:40:56.398432	2025-10-12 12:40:56.398432	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
235	21	practice	appendix	0	pending		\N	\N	\N	2025-10-12 12:40:56.398775	2025-10-12 12:40:56.398775	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
378	1404	diploma	intro	0	pending		\N	\N	\N	2025-11-29 13:01:05.05276	2025-11-29 13:01:05.05276	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
380	1404	diploma	theory	0	pending		\N	\N	\N	2025-11-29 13:01:05.058398	2025-11-29 13:01:05.058398	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
382	1404	diploma	design	0	pending		\N	\N	\N	2025-11-29 13:01:05.059186	2025-11-29 13:01:05.059186	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
384	1404	diploma	implementation	0	pending		\N	\N	\N	2025-11-29 13:01:05.059861	2025-11-29 13:01:05.059861	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
386	1404	diploma	conclusion	0	pending		\N	\N	\N	2025-11-29 13:01:05.060544	2025-11-29 13:01:05.060544	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
388	1404	diploma	sources	0	pending		\N	\N	\N	2025-11-29 13:01:05.061315	2025-11-29 13:01:05.061315	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
390	1404	diploma	appendix	0	pending		\N	\N	\N	2025-11-29 13:01:05.062058	2025-11-29 13:01:05.062058	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
392	1404	diploma	abstract	0	pending		\N	\N	\N	2025-11-29 13:01:05.062863	2025-11-29 13:01:05.062863	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
418	1406	diploma	intro	0	pending		\N	\N	\N	2025-11-29 19:39:09.940574	2025-11-29 19:39:09.940574	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
420	1406	diploma	theory	0	pending		\N	\N	\N	2025-11-29 19:39:09.941401	2025-11-29 19:39:09.941401	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
422	1406	diploma	design	0	pending		\N	\N	\N	2025-11-29 19:39:09.941968	2025-11-29 19:39:09.941968	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
424	1406	diploma	implementation	0	pending		\N	\N	\N	2025-11-29 19:39:09.942577	2025-11-29 19:39:09.942577	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
426	1406	diploma	conclusion	0	pending		\N	\N	\N	2025-11-29 19:39:09.943206	2025-11-29 19:39:09.943206	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
428	1406	diploma	sources	0	pending		\N	\N	\N	2025-11-29 19:39:09.94368	2025-11-29 19:39:09.94368	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
430	1406	diploma	appendix	0	pending		\N	\N	\N	2025-11-29 19:39:09.944061	2025-11-29 19:39:09.944061	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
432	1406	diploma	abstract	0	pending		\N	\N	\N	2025-11-29 19:39:09.944833	2025-11-29 19:39:09.944833	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
434	1406	diploma	cover	0	pending		\N	\N	\N	2025-11-29 19:39:09.945411	2025-11-29 19:39:09.945411	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
436	1406	diploma	content	0	pending		\N	\N	\N	2025-11-29 19:39:09.945905	2025-11-29 19:39:09.945905	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
438	1408	diploma	intro	0	pending		\N	\N	\N	2025-11-30 00:42:58.868036	2025-11-30 00:42:58.868036	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
440	1408	diploma	theory	0	pending		\N	\N	\N	2025-11-30 00:42:58.868946	2025-11-30 00:42:58.868946	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
442	1408	diploma	design	0	pending		\N	\N	\N	2025-11-30 00:42:58.869446	2025-11-30 00:42:58.869446	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
444	1408	diploma	implementation	0	pending		\N	\N	\N	2025-11-30 00:42:58.869891	2025-11-30 00:42:58.869891	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
446	1408	diploma	conclusion	0	pending		\N	\N	\N	2025-11-30 00:42:58.870329	2025-11-30 00:42:58.870329	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
448	1408	diploma	sources	0	pending		\N	\N	\N	2025-11-30 00:42:58.87075	2025-11-30 00:42:58.87075	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
450	1408	diploma	appendix	0	pending		\N	\N	\N	2025-11-30 00:42:58.87114	2025-11-30 00:42:58.87114	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
452	1408	diploma	abstract	0	pending		\N	\N	\N	2025-11-30 00:42:58.871531	2025-11-30 00:42:58.871531	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
454	1408	diploma	cover	0	pending		\N	\N	\N	2025-11-30 00:42:58.871912	2025-11-30 00:42:58.871912	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
456	1408	diploma	content	0	pending		\N	\N	\N	2025-11-30 00:42:58.872278	2025-11-30 00:42:58.872278	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
458	1409	coursework	intro	0	pending		\N	\N	\N	2025-11-30 01:40:05.785326	2025-11-30 01:40:05.785326	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
460	1409	coursework	theory	0	pending		\N	\N	\N	2025-11-30 01:40:05.786414	2025-11-30 01:40:05.786414	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
462	1409	coursework	design	0	pending		\N	\N	\N	2025-11-30 01:40:05.787133	2025-11-30 01:40:05.787133	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
464	1409	coursework	conclusion	0	pending		\N	\N	\N	2025-11-30 01:40:05.787713	2025-11-30 01:40:05.787713	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
466	1409	coursework	sources	0	pending		\N	\N	\N	2025-11-30 01:40:05.788295	2025-11-30 01:40:05.788295	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
468	1409	coursework	appendix	0	pending		\N	\N	\N	2025-11-30 01:40:05.788782	2025-11-30 01:40:05.788782	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
470	1409	coursework	cover	0	pending		\N	\N	\N	2025-11-30 01:40:05.789528	2025-11-30 01:40:05.789528	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
472	1409	coursework	content	0	pending		\N	\N	\N	2025-11-30 01:40:05.790116	2025-11-30 01:40:05.790116	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
474	1410	diploma	intro	0	pending		\N	\N	\N	2025-11-30 02:01:10.989031	2025-11-30 02:01:10.989031	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
476	1410	diploma	theory	0	pending		\N	\N	\N	2025-11-30 02:01:10.990343	2025-11-30 02:01:10.990343	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
478	1410	diploma	design	0	pending		\N	\N	\N	2025-11-30 02:01:10.991018	2025-11-30 02:01:10.991018	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
480	1410	diploma	implementation	0	pending		\N	\N	\N	2025-11-30 02:01:10.991586	2025-11-30 02:01:10.991586	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
482	1410	diploma	conclusion	0	pending		\N	\N	\N	2025-11-30 02:01:10.99207	2025-11-30 02:01:10.99207	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
484	1410	diploma	sources	0	pending		\N	\N	\N	2025-11-30 02:01:10.992484	2025-11-30 02:01:10.992484	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
486	1410	diploma	appendix	0	pending		\N	\N	\N	2025-11-30 02:01:10.992899	2025-11-30 02:01:10.992899	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
488	1410	diploma	abstract	0	pending		\N	\N	\N	2025-11-30 02:01:10.993446	2025-11-30 02:01:10.993446	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
490	1410	diploma	cover	0	pending		\N	\N	\N	2025-11-30 02:01:10.994049	2025-11-30 02:01:10.994049	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
492	1410	diploma	content	0	pending		\N	\N	\N	2025-11-30 02:01:10.994556	2025-11-30 02:01:10.994556	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
494	1411	diploma	intro	0	pending		\N	\N	\N	2025-12-01 20:41:36.847095	2025-12-01 20:41:36.847095	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
496	1411	diploma	theory	0	pending		\N	\N	\N	2025-12-01 20:41:36.849095	2025-12-01 20:41:36.849095	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
498	1411	diploma	design	0	pending		\N	\N	\N	2025-12-01 20:41:36.849725	2025-12-01 20:41:36.849725	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
500	1411	diploma	implementation	0	pending		\N	\N	\N	2025-12-01 20:41:36.850422	2025-12-01 20:41:36.850422	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
502	1411	diploma	conclusion	0	pending		\N	\N	\N	2025-12-01 20:41:36.850979	2025-12-01 20:41:36.850979	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
504	1411	diploma	sources	0	pending		\N	\N	\N	2025-12-01 20:41:36.85169	2025-12-01 20:41:36.85169	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
506	1411	diploma	appendix	0	pending		\N	\N	\N	2025-12-01 20:41:36.852265	2025-12-01 20:41:36.852265	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
508	1411	diploma	abstract	0	pending		\N	\N	\N	2025-12-01 20:41:36.852907	2025-12-01 20:41:36.852907	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
510	1411	diploma	cover	0	pending		\N	\N	\N	2025-12-01 20:41:36.853564	2025-12-01 20:41:36.853564	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
512	1411	diploma	content	0	pending		\N	\N	\N	2025-12-01 20:41:36.854314	2025-12-01 20:41:36.854314	\N	\N	\N	\N	\N	\N	\N	\N	\N	coursework
\.


--
-- Data for Name: user_projects; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.user_projects (id, user_id, active_project_type, created_at, updated_at) FROM stdin;
52	571	coursework	2025-11-13 22:20:06.908881	2025-11-13 22:20:06.908881
55	283	coursework	2025-11-17 01:12:25.131453	2025-11-17 01:12:25.131453
57	946	coursework	2025-11-18 17:12:34.657874	2025-11-18 17:12:34.657874
56	266	coursework	2025-11-17 09:52:13.585703	2025-11-23 00:17:33.60628
61	1405	diploma	2025-11-29 13:19:31.866388	2025-11-29 13:19:31.867812
63	1406	diploma	2025-11-29 19:39:09.936341	2025-11-29 19:39:09.937686
67	1409	coursework	2025-11-30 01:40:05.781234	2025-11-30 01:40:05.782891
71	1411	diploma	2025-12-01 20:41:36.8371	2025-12-01 20:41:36.844796
2	21	coursework	2025-08-11 11:20:21.5248	2025-11-04 13:23:51.122588
53	1385	coursework	2025-11-13 22:50:00.855488	2025-11-13 22:50:00.855488
46	1396	diploma	2025-11-05 21:50:52.755398	2025-11-15 22:58:14.890067
60	1404	diploma	2025-11-29 13:01:05.04727	2025-11-29 13:01:05.044974
65	1408	diploma	2025-11-30 00:42:58.865964	2025-11-30 00:42:58.867067
69	1410	diploma	2025-11-30 02:01:10.984777	2025-11-30 02:01:10.987414
48	1378	diploma	2025-11-09 17:59:05.533646	2025-11-09 17:59:05.534548
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.users (id, name, email, password, role, registeredat, lastloginat, lastlogoutat, faculty_id, department_id, avatar_url, active_project_type, is_online, last_seen, updated_at, avatar, specialty_id, group_id, phone) FROM stdin;
1396	Олег Рильський 	rylskiy.olen@lnu.edu.ua	$2a$06$MHoeHvZZ8oAulqmYT27EVuzxDEaXSFfx0.CWSiOCZcFZD3NKcQGt6	student	2025-11-05 19:48:58.308384	2025-12-07 12:41:48.015953	2025-12-06 23:56:53.415035	5	34	\N	\N	f	2025-11-29 12:57:23.484522	2025-11-05 19:48:58.308384	\N	\N	\N	\N
626	Софія Варецька	varetska.sofiia@lnu.edu.ua	$2a$06$aP4kgh5ymX/psJQKUVKIWOMfMo7Yff.dXrlV1JmWkum90sEOV5rKq	teacher	2025-11-05 13:13:21.680049	\N	\N	44	44	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
627	Ірина Кушнір	kushnir.iryna@lnu.edu.ua	$2a$06$nuJ2TNy62/MJwwXl.QXm/us7bbHk6Ju2GOPfNbbOPqCDILAYW/hoO	teacher	2025-11-05 13:13:21.680049	\N	\N	44	44	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
628	Зоряна Піскозуб	piskozub.zoriana@lnu.edu.ua	$2a$06$MWXvyv1LHYNXxw5Rb8E7cuwzcUsBLVcgH1FpO9WpUOo46.p7tdtbi	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
582	Лідія Демків	demkiv.lidiia@lnu.edu.ua	$2a$06$1OBIuPoLzXRLVbg0vtBnt.ZptahisFaMmez96NDe3Bdlc1KLQMkYG	teacher	2025-11-05 13:10:04.072109	2025-12-06 23:19:03.799827	2025-12-06 23:12:23.887827	5	35	\N	\N	f	2025-12-06 23:56:28.816216	2025-11-05 13:10:04.072109	\N	\N	\N	\N
56	Віталій Брусак	brusak.vitalii@lnu.edu.ua	$2a$06$huTkrs6423j51QE6Bv/KxekHy.9JdthMTa2cp8noIH4zBH6d1YyBO	teacher	2025-11-05 12:47:34.179085	\N	\N	2	11	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
1404	fffff rrrrrr	wwww@lnu.edu.ua	$2b$10$vyM8lkadVFt5.kHfgssykuhK9g0CJpsEH1LRNWph2BgUC2DnAl1OS	student	2025-11-29 13:00:57.582597	\N	\N	12	78	\N	\N	f	\N	2025-11-29 13:00:57.582597	\N	75	611	\N
107	Наталя Моркун	morkun.natalia@lnu.edu.ua	$2a$06$8mMZb/h9dspzljQ4hoiUiO3nJyZYvYmU3onrIUg3nCuYXsduBLXUG	teacher	2025-11-05 12:50:24.062717	2025-12-22 18:23:49.903844	2025-11-11 23:26:26.525291	5	33	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
114	Володимир Грабовський	hrabovskyi.volodymyr@lnu.edu.ua	$2a$06$8jtOLuhrin.n6wD04.5/MuTB5UsdJMzG4kqHCg/677DuFlzGwgBtq	teacher	2025-11-05 12:50:24.062717	2025-12-06 00:40:10.789639	2025-11-27 19:45:20.665908	5	32	\N	\N	f	2025-11-08 23:19:44.617132	2025-11-05 12:50:24.062717	\N	\N	\N	\N
1427	mdfnvndkd vnvmkdle	vnvnfkdoe@lnu.edu.ua	$2b$10$faKUepSYgE80F4N9LbXzp.qOEQoddvo3voCwO1izch3sAgylUaC1G	student	2025-12-14 16:54:47.622397	2025-12-28 12:56:29.159592	2025-12-28 12:59:31.446376	5	35	\N	\N	f	\N	2025-12-28 12:59:11.467616	\N	44	5	\N
580	Володимир Анохін	anokhin.volodymyr@lnu.edu.ua	$2a$06$pva9/VCFR/D4rZaiElQqz.OjUGL.tJ2cLr5F1boJVJrrVDecIstZ6	teacher	2025-11-05 13:10:04.072109	2025-12-28 13:24:18.654307	2025-11-05 19:49:17.825568	5	35	\N	\N	f	2025-11-05 19:49:24.500425	2025-11-05 13:10:04.072109	\N	\N	\N	\N
1411	fgggg bbbhgfffd	ghbnvfgh@lnu.edu.ua	$2b$10$RGRuh8nbU9QGzEcDQ8RMmuLaqCLbG7SbtYhVLJJiTgEJGnkdTP//u	student	2025-12-01 20:39:16.954789	2025-12-07 14:50:21.19041	2025-12-07 14:50:51.628092	13	86	\N	\N	f	\N	2025-12-01 20:39:16.954789	\N	82	645	\N
1421	jnfjfnjfn cbjfndj 	vmmffm@lnu.edu.ua	$2b$10$thvneYNomtSIRr4ukRCrjuGN750QOKg5xGrZwbHJqJl22MpJ4bum6	student	2025-12-07 13:53:06.079559	2025-12-07 16:41:07.906199	2025-12-07 13:54:02.537855	5	34	\N	\N	f	\N	2025-12-07 13:53:06.079559	\N	45	14	\N
1412	mvvmvdd ddddswss	ddkkfnm@lnu.edu.ua	$2b$10$8m7vM65kRQ8SVjHzhC0Cg.QvqVCFWMhEscJAdPkxjER64/1KGqq4i	student	2025-12-06 17:52:26.410155	2025-12-07 16:59:07.464248	2025-12-07 16:59:33.468374	15	97	\N	\N	f	\N	2025-12-06 17:52:26.410155	\N	92	715	\N
1426	fffggvv fffdvv	fmvvmfg@lnu.edu.ua	$2b$10$p.7sHQEe4erLXF5fAnB9M.288J5YkDrZOTID0owUFf4ZelcMj6nla	student	2025-12-09 00:07:13.808711	2025-12-09 01:02:21.916118	\N	5	34	\N	\N	f	\N	2025-12-09 00:07:13.808711	\N	45	17	\N
109	Іван Карбовник	karbovnyk.ivan@lnu.edu.ua	$2a$06$9FSMrPPDavrqeBmfIYAuu.EW9yewzERzcGFhpGBkknFINb2f2WfDS	teacher	2025-11-05 12:50:24.062717	2025-12-12 23:17:43.873139	\N	5	34	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
115	Богдан Павлишенко	pavlyshenko.bohdan@lnu.edu.ua	$2a$06$4TBBlINz0.3ZDaOt/e7Eq.UJDPcM81nHuPi8gmvh3VdfS3j4X2HVe	teacher	2025-11-05 12:50:24.062717	2025-12-13 21:17:27.482515	2025-12-13 21:18:14.307996	5	35	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
1405	reeked fnfnfnfn	fmmffn@lnu.edu.ua	$2b$10$bdOYilriWqCNVnoSQDYbg.Moukl48LpIlOdSgtlffGAjo91UWdHiK	student	2025-11-29 13:19:28.072589	\N	\N	5	34	\N	\N	f	\N	2025-11-29 13:19:28.072589	\N	47	35	\N
940	Любомир Пархуць	parkhuts.liubomyr@lnu.edu.ua	$2a$06$PwT1HAy8JoMdsHKwGQpCguhZ.kPPqVz61dp0hmTHregN3kytvca1q	teacher	2025-11-05 13:20:07.598583	2025-12-01 20:40:48.258617	2025-12-01 20:41:17.579408	89	89	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
1413	Sofia Letay	LetaySofia@lnu.edu.ua	$2b$10$.izFnEI8uK6RY2r30zzRVOBEdkEDtGPuC8oRMNvy2tftjPaK.d0Cu	student	2025-12-06 19:12:20.643152	\N	\N	5	34	\N	\N	f	\N	2025-12-06 19:12:20.643152	\N	45	15	\N
106	Ігор Оленич	olenych.ihor@lnu.edu.ua	$2a$06$FV6UCoiDM3yJE5ZXlq/uWOcrZnv0/TEuPNRgl728hSsU/4GZPvowe	teacher	2025-11-05 12:50:24.062717	2025-12-07 13:54:10.12743	\N	5	33	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
576	Ростислав Романишин	romanyvshyn.rostyslav@lnu.edu.ua	$2a$06$10DX5kCTtixM2mWhoC8rG.I.CKTINAomUKzFS0hfikOhh0yP6pcXm	teacher	2025-11-05 13:10:04.072109	2025-12-09 01:00:18.573592	2025-12-09 01:02:16.203069	5	34	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
1428	jgngnff fmmvmfmd	fnfjfjdf@lnu.edu.ua	$2b$10$wZvCADX.T4Lu3zxVPsaXlOyPst1WR7a544ZRlczHjuNo2p/2K6PVy	student	2025-12-14 21:42:16.290715	2025-12-28 13:41:11.670951	2025-12-28 13:35:41.578772	5	34	\N	\N	f	\N	2025-12-14 21:42:58.949844	\N	45	16	\N
1406	ccccc ddddddd	fnfnffn@lnu.edu.ua	$2b$10$KhizMQu95nOmufdZr71kEe2mVwSugc5fWhXtA/w2d9G6ljDFh77Q.	student	2025-11-29 19:39:05.888393	\N	\N	13	86	\N	\N	f	\N	2025-11-29 19:39:05.888393	\N	84	657	\N
1414	gghkjn gbkjn	bkbkjbk@lnu.edu.ua	$2b$10$fa9d5XxGy7kL3BeRGctQL.xC2PxtoM895hebE7JsDDpdWpMFc/Rs.	student	2025-12-06 21:59:15.308788	\N	\N	5	35	\N	\N	f	\N	2025-12-06 21:59:15.308788	\N	45	14	\N
1422	cmcvchgvm chagvhj	gjgjfj@lnu.edu.ua	$2b$10$WnWZAeDyRWLyHlqOAzTMk.AaVs1IedlJnn2KsGH.CdPXvZgvVQm6W	student	2025-12-07 14:51:34.244505	\N	\N	5	34	\N	\N	f	\N	2025-12-07 14:51:34.244505	\N	44	5	\N
220	Андрій Бондаренко	bondarenko.andrii@lnu.edu.ua	$2a$06$lUeD4nRVRbi8VqQmwlfhHe6xFoTZrsikYjB4G6UI4UXb8Ax5bC7De	teacher	2025-11-05 12:54:38.389697	\N	\N	9	59	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
1407	ddmdmdmdmd ffkfkfkfkf	kkdfkfkfk@lnu.edu.ua	$2b$10$3ZpY07w935bSHEz7CVH9kuUziJ4NTKmc4Fli6pAUK/Oe1UyJ83ELe	student	2025-11-30 00:22:14.557119	\N	\N	11	74	\N	\N	f	\N	2025-11-30 00:22:14.557119	\N	70	592	\N
583	Тарас Ненчук	nenchuk.taras@lnu.edu.ua	$2a$06$n7sML7Q28zq/8zSIX1PyUOw1KOQxEIfuUj/bhst5vBZjOvsnzLDXm	teacher	2025-11-05 13:10:04.072109	2025-12-06 22:00:41.489538	2025-12-06 22:01:26.738272	5	35	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
1423	mvgvvkgv ccvjgvjv	vjhbgvjhb@lnu.edu.ua	$2b$10$miWKlEHQuEOZdEEev9CEDOl4y915MIkaFK7B7aQJdxc1CvkeraUZy	student	2025-12-07 17:00:06.950278	\N	2025-12-07 17:00:54.638414	5	33	\N	\N	f	\N	2025-12-07 17:00:06.950278	\N	45	15	\N
1408	dfmfmffm ddddddd	fmfmffm@lnu.edu.ua	$2b$10$3SbanZN7GBhkm/2pTyoY2OafUJRUdj3CZV.xJ.5Ui28Q4NGd0zHQy	student	2025-11-30 00:38:28.543326	2025-11-30 00:46:53.50156	2025-11-30 00:41:53.302417	11	73	\N	\N	t	2025-11-30 00:42:53.548002	2025-11-30 00:38:28.543326	\N	69	584	\N
1383	Сергій Рендзіняк	rendziniak.serhii@lnu.edu.ua	$2a$06$QkV50j2PquiszPlFsQ0VbeSr8pl9eUA/Wnt8BNz5nheIudz7eQ2Ym	teacher	2025-11-05 13:29:08.817137	2025-12-06 22:01:35.449839	2025-12-06 22:02:56.840604	34	34	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1424	jbbkjnlm yvfgbkkn	gujbkn@lnu.edu.ua	$2b$10$3uAq9mm7c0cAEzL6ilScvOOW2em8RAtoHeZghr2/3qh9mqVHBT1EW	student	2025-12-07 17:22:59.800044	\N	\N	5	34	\N	\N	f	\N	2025-12-07 17:22:59.800044	\N	45	15	\N
234	Юрій Мороз	moroz.yurii@lnu.edu.ua	$2a$06$v3/FfUzuQYlMNoDpHMin0.bVzYh/DIssFOAGXgCF1wCG2JHQqG3Re	teacher	2025-11-05 12:57:42.152688	2025-11-30 00:41:59.564302	2025-11-30 00:42:44.928995	11	74	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
21	Bodya Dmytriv	Bodya.Dmytriv@lnu.edu.ua	$2a$06$l2f9TWxgAjln5IMPwXOrBOvk6fu/JptTU.zlVNf.rhF1kN4D7mzIm	student	2025-08-10 00:31:52.059201	2025-12-13 00:23:00.346868	2025-12-12 22:43:13.128308	13	86	\N	coursework	f	2025-11-18 17:15:14.921503	2025-11-01 14:54:38.449228	\N	\N	\N	\N
1425	fnmfkddk, fffmkedf	fmfmgmr@lnu.edu.ua	$2b$10$4lGpWaGeiyCM6YAUgOzOdOY5Cagf.a6R7bS0dahVTJ1D8rAIQiw8i	student	2025-12-07 23:13:54.282648	2025-12-13 21:18:36.97927	2025-12-09 00:06:48.909742	5	35	\N	\N	f	\N	2025-12-07 23:13:54.282648	\N	44	6	\N
1409	ffffjfjffj fmfffjfjfjf	vjvgjgjgj@lnu.edu.ua	$2b$10$7f7AEuAvmQpFRW8Y3I6zUOiFuar6nocL6jWjDvUqhtjJG3EvKW4AC	student	2025-11-30 01:39:58.056853	2025-11-30 01:42:01.438073	2025-11-30 01:41:08.596145	13	89	\N	\N	f	\N	2025-11-30 01:39:58.056853	\N	82	646	\N
1415	fffrddvv ffrdfvv	jfjffmkb@lnu.edu.ua	$2b$10$Ldjho/2wHgM7LLFU5j8ktOSxIxKFZTPwlnisyCZCHv5VAh5yQ2R6.	student	2025-12-06 22:55:32.210908	\N	\N	5	34	\N	\N	f	\N	2025-12-06 22:55:32.210908	\N	45	14	\N
266	Георгій Шинкаренко	shynkarenko.heorhii@lnu.edu.ua	$2a$06$5isfkHV6dZvffyL.NUF84e3VejRxcRWER1XOMJ9HrFUsry3x/v5vi	teacher	2025-11-05 12:59:28.40274	2025-11-30 01:41:15.21726	2025-11-30 01:41:55.888617	13	86	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
1416	fmvmvfkd dmcjvkkfc	vmvmfmd@lnu.edu.ua	$2b$10$PXDtb4q6ToOuq.MISaD5DeF2aVB9sN8ZOQMB4oqEBE30PVlqPvMPK	student	2025-12-06 23:57:31.695224	\N	\N	5	34	\N	\N	f	\N	2025-12-06 23:57:31.695224	\N	45	14	\N
1410	bbbb ccccccc	cmvmvmv@lnu.edu.ua	$2b$10$FhyqoixzOGa.ZWP.GZWiVOr3IG8w0XbGyTcCaWTbOWBA5wqe51zQ2	student	2025-11-30 02:01:05.64764	2025-11-30 02:04:25.267685	2025-11-30 02:03:20.710203	11	71	\N	\N	f	\N	2025-11-30 02:01:05.64764	\N	70	594	\N
1417	fmcdd vvddvd	cmvmvmf@lnu.edu.ua	$2b$10$T4Z.OWGYKo6dOSpBS4W/Lujk7AgCz6IAAHoFmHpCU557b4hRXS4cK	student	2025-12-07 00:24:05.202883	\N	\N	5	34	\N	\N	f	\N	2025-12-07 00:24:05.202883	\N	45	15	\N
729	Ростислав Романюк	romaniuk.rostyslav@lnu.edu.ua	$2a$06$jyKlAxZfWwpdCKY0zcwaL.kyP92cALt3.oJvy./BaG.IUxfuUriXG	teacher	2025-11-05 13:16:09.432404	\N	\N	74	74	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
730	Маркіян Мальський	malskyi.markiian@lnu.edu.ua	$2a$06$CLltuePUQ0qQmBlW2zVL6u0GU0HoSddAD3fZjys25DPqUdN5ZC5HW	teacher	2025-11-05 13:16:09.432404	2025-11-30 02:03:29.43324	2025-11-30 02:04:16.356427	74	74	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
1418	dssfvcv ddsddac	vdmvmv@lnu.edu.ua	$2b$10$adOjTna9X1OdU/er07qIBeN8ujRGCvyMn5R5IheFfuUegwEJg68AW	student	2025-12-07 00:37:18.119587	\N	\N	5	34	\N	\N	f	\N	2025-12-07 00:37:18.119587	\N	45	15	\N
1419	mvmvmvv fkkkffvd	vbjfjff@lnu.edu.ua	$2b$10$9Izh7SZpVxN3Omxu7uR6mu/hxjmo7U4Ofhylrsu8VV1OhBp73AZ4u	student	2025-12-07 01:30:49.762364	\N	\N	5	34	\N	\N	f	\N	2025-12-07 01:30:49.762364	\N	45	14	\N
1420	fogged fdffscx	cncvnvnf@lnu.edu.ua	$2b$10$a8XrEQdVRMWtn92pglFeVurOflhJgyLAayA9hY3CgEUhBm9LO92vC	student	2025-12-07 02:03:42.890796	\N	\N	5	34	\N	\N	f	\N	2025-12-07 02:03:42.890796	\N	44	4	\N
574	Іван Болеста	bolesta.ivan@lnu.edu.ua	$2a$06$M7lyEgTfQQCabmbyP4QPA.QvpPPtjG3TZrDmS07EgZ1bF.MT3W42K	teacher	2025-11-05 13:10:04.072109	2025-12-07 02:06:09.40413	\N	5	34	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
1296	Валерій Джунь	dzhun.valerii@lnu.edu.ua	$2a$06$4uTKrs0MojKJFBzg2xE3F.cyVZNYhp6r3Hz5SAlWN08LlXEvzN.te	teacher	2025-11-05 13:29:08.817137	\N	\N	110	110	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
902	Зоряна Макогін	makohin.zoriana@lnu.edu.ua	$2a$06$uzoCSSYzvdic.6vYd1eumuhyvMgc49t91AmbXAiaYQK.9Lmo213EO	teacher	2025-11-05 13:20:07.598583	\N	\N	75	75	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
903	Олексій Мороз	moroz.oleksii@lnu.edu.ua	$2a$06$DwkqCn54RIkwIVt459wT3u4wzG0sW2UIDwAHpQfcQqz9b9pLdcoS6	teacher	2025-11-05 13:20:07.598583	\N	\N	75	75	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
1401	vika qwerty	vika.qwerty@lnu.edu.ua	$2b$10$xVCZ0AJQfieUZnPqF7DeJurBYAIWOyOkYYyNxvl6/uvTQHm7OIdNu	student	2025-11-26 20:26:20.169681	\N	\N	13	87	\N	\N	f	\N	2025-11-26 20:26:20.169681	\N	84	656	\N
1402	viktor qwerty	viktor.qwerty2@lnu.edu.ua	$2b$10$Br9xNl8Ew7qOw.G41DAZp.GgUbFjzCcVzUkOY8i9sc946SVFsBgO6	student	2025-11-26 20:38:48.942771	\N	\N	10	67	\N	\N	f	\N	2025-11-26 20:38:48.942771	\N	41	224	\N
1398	Victor Awety	victor.awety@lnu.edu.ua	$2b$10$Qey0sTZuGIL/S7dwNo1SKOjhom2neMVujxxWTRmBbAa.n8132ojJq	student	2025-11-26 00:31:32.948153	\N	\N	5	34	\N	\N	f	\N	2025-11-26 00:31:32.948153	\N	45	16	\N
1400	vnvnvnvff fffffff	qadndnnfnf@lnu.edu.ua	$2b$10$qCIcnATZCCBzD5msr.PHTuLtfgeQho/2J38Lp3Jv94D20EwVh0soq	student	2025-11-26 00:38:19.685813	\N	\N	16	101	\N	\N	f	\N	2025-11-26 00:38:19.685813	\N	107	855	\N
1363	Марія Гнатишин	hnatyshyn.mariia@lnu.edu.ua	$2a$06$x/6cXqVfYQE72ePV1hoVZ.7ib9ORyfuL.BguNQxZ53eehaUo79Poy	teacher	2025-11-05 13:29:08.817137	\N	\N	22	22	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1364	Ростислав Гнатюк	hnatiuk.rostyslav@lnu.edu.ua	$2a$06$1bmHcTGIFngbzkW18komoeqT8Hxrpq18W5MHyDDV6N224A31O1Oui	teacher	2025-11-05 13:29:08.817137	\N	\N	22	22	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1403	oleh oleh	olenfjfjfjf@lnu.edu.ua	$2b$10$0x6uYHAagwlkMUHusSZF8ukhsjFBMjKjgACLRY7Zl6sn6cyC3Uizq	student	2025-11-26 20:58:54.923812	\N	2025-11-26 21:26:03.144205	13	88	\N	\N	f	\N	2025-11-26 20:58:54.923812	\N	82	646	\N
22	Olha Bermuda	Olha.Bermuda@lnu.edu.ua	$2a$06$T9Pc82q0q4YJDAnyeZcNYelkHchaSTCGMm3hTxGSWlYXA0OBHlUZm	teacher	2025-09-01 22:03:57.368912	2025-11-07 12:36:30.657863	2025-11-07 11:15:36.960432	17	107	\N	\N	f	2025-11-05 00:27:31.154889	2025-11-01 14:54:38.449228	\N	\N	\N	\N
629	Ірина Байцар	baitsar.iryna@lnu.edu.ua	$2a$06$qVd6y2SgBBMqQZ7s3T75te4Fl4CIj6nZtGu2E7mzMwLHMjOEmR78.	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
630	Наталія Демчук	demchuk.nataliia@lnu.edu.ua	$2a$06$QyRd1ql5yICPPPjeOsszhehWFrHbuXzPzw5pbSJzRdFwWomSNRxGW	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
25	Олена Доманська	domanska.olena@lnu.edu.ua	$2a$06$YVhLPCo724jMWKlOv3KoheVdo6V2z8nwJdTfmhD3xJ8VzlGRcKExm	teacher	2025-11-05 12:45:35.277317	\N	\N	10	67	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
631	Аркадій Кабов	kabov.arkadii@lnu.edu.ua	$2a$06$eodZFAj39cUYMRtx1zK5vO/i.1DlwQ6VugjDla0TekDEWDT4CtiVi	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
26	Наталія Гарасим	harasym.nataliia@lnu.edu.ua	$2a$06$Vj7oWBW0q6JbLH1tPz40DuLu.f4O0/h7I1271Yl/CiK5Rg4WvhHXK	teacher	2025-11-05 12:45:35.277317	\N	\N	1	1	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
27	Марія Дика	dyka.mariia@lnu.edu.ua	$2a$06$/m9xy/Lq/zLbm5yLXDz2RePb7YdcnzGfkgdszPO7vySvD95eMq7Ci	teacher	2025-11-05 12:45:35.277317	\N	\N	1	1	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
28	Наталія Сибірна	sybirna.nataliia@lnu.edu.ua	$2a$06$E8mLweffgkUp3SuIrBvxv.L5R73Qy65KKqTqouUqkUuW9Q2bT/2Zu	teacher	2025-11-05 12:45:35.277317	\N	\N	1	2	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
632	Ганна Кость	kost.hanna@lnu.edu.ua	$2a$06$eW1mN7PBHr0FLgyM.SexWew2qBr9cnnMa7Nb.u/k3Jb9IpenX.jy2	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
29	Галина Гачкова	gachkova.halyna@lnu.edu.ua	$2a$06$HRtgnW1RESqb8JCnQKpsN.wa/x36m5twt6oOwZ38nTW1e8I2GvqwG	teacher	2025-11-05 12:45:35.277317	\N	\N	1	2	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
30	Марія Нагалєвська	nahalevska.mariia@lnu.edu.ua	$2a$06$QlDnbij52uhujyN0gbzxquxvbBEmfgw7Jv0dpbU0EgPeMGvfSysvW	teacher	2025-11-05 12:45:35.277317	\N	\N	1	2	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
31	Віталій Гончаренко	honcharenko.vitalii@lnu.edu.ua	$2a$06$pkmQ8slnxcs/slNHqEOto.hlgax7ntwVC.gYV0fR/gN6bxx7lrpfS	teacher	2025-11-05 12:45:35.277317	\N	\N	1	3	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
633	Вікторія Лучкевич	luchkevych.viktoriia@lnu.edu.ua	$2a$06$ONdZemx1NJCxpbmnNhuLF.okArlQMr9OKwpR4V6.o5/0.ohEqaZlm	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
32	Ольга Дика	dyka.olha@lnu.edu.ua	$2a$06$CUoqVyr68YONkpZEdmnnSOLmJSp4NnVe8Nfef1Ou7qlqRcPw5pJAG	teacher	2025-11-05 12:45:35.277317	\N	\N	1	3	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
33	Віктор Начичко	nachychko.viktor@lnu.edu.ua	$2a$06$rfx89mMRHNaUxxVJX3JGtexQJXkm/j9kvoqUwCCVj2b5HJO1SH4K6	teacher	2025-11-05 12:45:35.277317	\N	\N	1	3	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
34	Андрій Прокопів	prokopiv.andrii@lnu.edu.ua	$2a$06$NT0M8IYOs30a5oGqs64vHud0vu7jDE5I3MBe5hZ5PCB1Oa5won.VO	teacher	2025-11-05 12:45:35.277317	\N	\N	1	3	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
35	Наталія Голуб	holub.nataliia@lnu.edu.ua	$2a$06$uq0xd4SD9zjX5A6yMlRcIeJ6w4kkyWsZ53TfAzl8YFHLhXpr3E.lG	teacher	2025-11-05 12:45:35.277317	\N	\N	1	4	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
36	Світлана Горбулінська	horbulynska.svitlana@lnu.edu.ua	$2a$06$wXAZqGG.jkU8ZKQJGFv1OOaF1Orc5z7HX/hm9pwxYoxNDblJd2gBm	teacher	2025-11-05 12:45:35.277317	\N	\N	1	4	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
634	Іван Мандзак	mandzak.ivan@lnu.edu.ua	$2a$06$HBh85OZzx5pewlr4gd3seOFms4/wI7JpxT4p11.CqunryWXXt/DWq	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
37	Василь Сирватка	syrvatka.vasyl@lnu.edu.ua	$2a$06$jJv9PZPnwhHrQhY/4nH1fumr7la0OkFyH3k5MEfvyB3va/Sb/P3/W	teacher	2025-11-05 12:45:35.277317	\N	\N	1	4	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
635	Олена Сайфутдінова	saifutdinova.olena@lnu.edu.ua	$2a$06$ZKqu0mRihynvkV8he/kMq.VA9AMh7Doa6McpV0dZq4ZWh9L8TSIsS	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
38	Ігор Капрусь	kaprus.ihor@lnu.edu.ua	$2a$06$8A9/B7hKGbgnttE/gUqe9..Odq3JQnXGVFypDt4CeZrvgS1tifQKC	teacher	2025-11-05 12:45:35.277317	\N	\N	1	9	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
636	Мирослава Фроляк	froliak.myroslava@lnu.edu.ua	$2a$06$xeI7IviCTUJEog/yzLwMZ.W5y72bQBDh9ZaM9WozsKYaDP8.u.tNK	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
637	Ольга Чапля	chaplia.olha@lnu.edu.ua	$2a$06$aHJT.91qeSTOiQ0yEMLxTeTrthQCA/bqjzkLnZlIf.GRdE/zVZsVG	teacher	2025-11-05 13:13:21.680049	\N	\N	45	45	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
638	Алла Паславська	paslavska.alla@lnu.edu.ua	$2a$06$2MKyXIqHkFXtcKDp9nj8Cur0opPbdJRZOFT1aQs2WX5ONpD0Nz.vO	teacher	2025-11-05 13:13:21.680049	\N	\N	46	46	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
39	Наталія Джура	dhura.nataliia@lnu.edu.ua	$2a$06$zEnG/6MwQc48P8b4/dVaX.7mgNRvOV.qBmPWFE4RlQ/rD2PK3S5/W	teacher	2025-11-05 12:45:35.277317	\N	\N	1	9	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
639	Володимир Сулим	sulym.volodymyr@lnu.edu.ua	$2a$06$UAp.jdQkpZkcygnGQVk7luOuWeCh9IJIDUyX7btrZi8/oEPW7AQw.	teacher	2025-11-05 13:13:21.680049	\N	\N	46	46	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
640	Роксоляна Кохан	kokhan.roksoliana@lnu.edu.ua	$2a$06$zZbAh.n8sH5qYhZEZHL2lOCXdMwxSKDY8j5jkLTiuHT6vVj5uricK	teacher	2025-11-05 13:13:21.680049	\N	\N	46	46	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
641	Богумила Лесечко	lesechko.bohumila@lnu.edu.ua	$2a$06$D1mKJzoKdUIyRfpnqKV1uewRm9n8PrVil/lyQAixBH4JQ7x.XiALq	teacher	2025-11-05 13:13:21.680049	\N	\N	46	46	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
40	Віктор Сеньків	senkiv.viktor@lnu.edu.ua	$2a$06$EDs2mgba7g5nmXJi7rrWVucs6o3vPXCCrpGivh1JL6AqWlq9dUCRS	teacher	2025-11-05 12:45:35.277317	\N	\N	1	9	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
642	Наталя Паламар	palamar.nataliia@lnu.edu.ua	$2a$06$BjHQ0VMixRRfnSCR1GnyPOys5a8ttggWpHxj2nmZFCposI9KDSSIO	teacher	2025-11-05 13:13:21.680049	\N	\N	46	46	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
41	Йосиф Царик	tsaryk.yosyf@lnu.edu.ua	$2a$06$4PICWlPwKvBslpq0gCQhYOBysuneKZcBYZsCljG22J6C/zz.W1beC	teacher	2025-11-05 12:45:35.277317	\N	\N	1	5	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
42	Андрій Бокотей	bokotei.andrii@lnu.edu.ua	$2a$06$H6626PoQDJU7S4Anj0/RZeEvIrO22V9ci3WgqYGa150X3gijYGSGW	teacher	2025-11-05 12:45:35.277317	\N	\N	1	5	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
43	Ігор Дикий	dykyi.ihor@lnu.edu.ua	$2a$06$ttS1MnZ8ZqjcZArRVLykd.O1dPuC7xXRkYzGLvC9.gIaQAEVob5Oq	teacher	2025-11-05 12:45:35.277317	\N	\N	1	5	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
44	Остап Решетило	reshetylo.ostap@lnu.edu.ua	$2a$06$Nn3wn0sFwYEcNnm6GQmwfOljUfGdr2Y9rm/zF6JVj6YXHNywnz8L6	teacher	2025-11-05 12:45:35.277317	\N	\N	1	5	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
45	Ігор Хамар	khamar.ihor@lnu.edu.ua	$2a$06$MKbKgSenlLWVTAwQGFgpveh3n3KcDri6QaPzGgo29VyM/NdbNMV.2	teacher	2025-11-05 12:45:35.277317	\N	\N	1	5	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
46	Андрій Галушка	halushka.andrii@lnu.edu.ua	$2a$06$JR5WBjnBtMqF.y6y5LpmHeWbdf8ld2aP6mvfaI.xAW1tx93fCXt5S	teacher	2025-11-05 12:45:35.277317	\N	\N	1	6	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
47	Ярина Колісник	kolisnyk.yaryna@lnu.edu.ua	$2a$06$OfKsdEGTAcG1foAYerHHFO0x3XAI1dFoyQcPfhuFlrQgnuoRYCEAe	teacher	2025-11-05 12:45:35.277317	\N	\N	1	6	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
48	Тарас Перетятко	peretiatko.taras@lnu.edu.ua	$2a$06$f6RKnh3ZME/uyKUgGS6B1uNWBK3cF7kv18sxvapfi0sG3dEGg6A3q	teacher	2025-11-05 12:45:35.277317	\N	\N	1	6	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
49	Мирослав Дністрянський	dnistrianskyi.myroslav@lnu.edu.ua	$2a$06$iHJeLmvs5ZagdFtNA4GVG.sa3dW7350LEUjl/sDbTz51jRcRWLJSm	teacher	2025-11-05 12:45:35.277317	\N	\N	2	10	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
50	Андрій Зубик	zubyk.andrii@lnu.edu.ua	$2a$06$MBqiw6zslyMgKIh6DZEWKu45E8TawjD/WQRsYNy3luNnX4UMzU7sK	teacher	2025-11-05 12:45:35.277317	\N	\N	2	10	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
51	Оксана Склярська	skliarska.oksana@lnu.edu.ua	$2a$06$C3eqkfmP8jeFGx0JIwQmZe5dEMLrXJrtt9lljZ2qurY0cQrOKSksW	teacher	2025-11-05 12:45:35.277317	\N	\N	2	10	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
52	Володимир Біланюк	bilanuk.volodymyr@lnu.edu.ua	$2a$06$zSXRMENfWTdakJoc0FH7VOpKoojzL5.anc/torf1/NwbTLmLOeP7C	teacher	2025-11-05 12:45:35.277317	\N	\N	2	17	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
53	Маріне Елбакідзе	elbakidze.marine@lnu.edu.ua	$2a$06$vTFdzTGZzP0TRLyUhtp4SukL5DYFBCZYPWSY6xM171IJhYd7XAqea	teacher	2025-11-05 12:45:35.277317	\N	\N	2	17	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
54	Анатолій Смалійчук	smaliichuk.anatolii@lnu.edu.ua	$2a$06$VCKo51rgTSO07edKYySq/eInwmiexDT8nFdkW2vIRftqVEchmV7ea	teacher	2025-11-05 12:45:35.277317	\N	\N	2	17	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
55	Андрій Богуцький	ohotskyi.andrii@lnu.edu.ua	$2a$06$adPTUs8se/qsrTmCzwmsLuFmBRHBkQCG5hFuKySm3xWhddWciugeu	teacher	2025-11-05 12:45:35.277317	\N	\N	2	11	\N	\N	f	\N	2025-11-05 12:45:35.277317	\N	\N	\N	\N
57	Олена Томенюк	tomeniuk.olena@lnu.edu.ua	$2a$06$gtJ8uG9CcIkv3vg7yx3qgOp//E0KzcpozoKJVfMLe6EYAP4aqmX2G	teacher	2025-11-05 12:47:34.179085	\N	\N	2	11	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
58	Андрій Яцишин	yatsyshyn.andrii@lnu.edu.ua	$2a$06$D3iwC4n5y7tqXu5xX9JnsOCNUj5IlAr1fPMzaaJ/5VuUcs92.43eG	teacher	2025-11-05 12:47:34.179085	\N	\N	2	11	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
59	Світлана Шульц	shults.svitlana@lnu.edu.ua	$2a$06$IEDGWytNHdAFrFOpjJlC7eN0VSEmIhz6ct.jfe2KOKHcDVnUeyRly	teacher	2025-11-05 12:47:34.179085	\N	\N	2	16	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
60	Ольга Біланюк	bilanuk.olha@lnu.edu.ua	$2a$06$9vq17xjMEFXGZR5YxhjoQuauoHDf7efVuaJMxQ0iwduannfb7YSR6	teacher	2025-11-05 12:47:34.179085	\N	\N	2	16	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
61	Анна Грицишин	hrytsyshyn.anna@lnu.edu.ua	$2a$06$5B9Iv9txMoLk5stWnreluO4gKz8DFiJaX0P1gJz4omv1kEBaWHxw6	teacher	2025-11-05 12:47:34.179085	\N	\N	2	16	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
62	Вікторія Кізима	kizyma.viktoriia@lnu.edu.ua	$2a$06$.THvMBeT5Zp44dXyaswWhOIdRTWSCL8fqS/0iokXBRPDi0EBbZu3u	teacher	2025-11-05 12:47:34.179085	\N	\N	2	16	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
63	Олег Гайовський	gaiovskyi.oleh@lnu.edu.ua	$2a$06$bb.VybSp1mm04u3cp7qb..EevZdzBywkmXgNfh/a2RDvPb7zt2mQ6	teacher	2025-11-05 12:47:34.179085	\N	\N	3	18	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
64	Юрій Віхоть	vikhot.yurii@lnu.edu.ua	$2a$06$jhRxAFJyLF7258ITZDMYq.QtPD4c8Bep2rCYuY5RKoiIEsPzYch1.	teacher	2025-11-05 12:47:34.179085	\N	\N	3	18	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
65	Ігор Губич	hubych.ihor@lnu.edu.ua	$2a$06$c3MD2IulWt0i5itcbx/Mou/w/IBMivJC4zclAJfbjyY1XZ2uIbXJ.	teacher	2025-11-05 12:47:34.179085	\N	\N	3	18	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
66	Сергій Ціхонь	tsikhon.serhii@lnu.edu.ua	$2a$06$L9eeX9cOjCkb97l2ORRPleQpWzghzDLUNCNuSrTCLGUHDW8Uy1wyW	teacher	2025-11-05 12:47:34.179085	\N	\N	3	18	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
67	Олександр Андрейків	andreikiv.oleksandr@lnu.edu.ua	$2a$06$NV0URdkp6RYZhS6xdeKKl.rjpPp/5w24qKP6O29KvrP0MaDqSJLTC	teacher	2025-11-05 12:47:34.179085	\N	\N	10	68	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
68	Світлана Урба	urba.svitlana@lnu.edu.ua	$2a$06$vilDGJRTepShYJuh57FQ7eWX1eDaUFLy90pOp4cZYyCHCH6Rx8zD2	teacher	2025-11-05 12:47:34.179085	\N	\N	4	25	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
69	Надія Банера	banera.nadiia@lnu.edu.ua	$2a$06$duzKIrraQYs4TN.tZotaNu4XWJO8sDWMrG4arOfjAiKBm7MIV3ONa	teacher	2025-11-05 12:47:34.179085	\N	\N	4	25	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
70	Вікторія Дмитрук	dmytruk.viktoriia@lnu.edu.ua	$2a$06$Tw5ERBeIyfkP.Vv83Fx6tOwSsKySe5W4W3sx7DoSzUZd7fsAvW5a2	teacher	2025-11-05 12:47:34.179085	\N	\N	4	25	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
71	Зоряна Артим-Дрогомирецька	artym-drohomyretska.zoriana@lnu.edu.ua	$2a$06$hECGh06frw7M2oOQ0EdEKuTVSQ8cUZV5o084pQ4TnX.0dyXjQDSru	teacher	2025-11-05 12:47:34.179085	\N	\N	4	24	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
72	Василь Антонів	antoniv.vasyl@lnu.edu.ua	$2a$06$HzinCNDFPBBej3QcjLa0m.NN1Xx0c1Xepfx66cKxEY5dpRoiylqy.	teacher	2025-11-05 12:47:34.179085	\N	\N	4	24	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
73	Наталія Дацків	datskiv.nataliia@lnu.edu.ua	$2a$06$5urAFZfH3Ym87pumW2AbXOENy.dWwiC./67PGWTM6dvBNlsW06YLe	teacher	2025-11-05 12:47:34.179085	\N	\N	4	24	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
74	Семен Матковський	matkovskyi.semen@lnu.edu.ua	$2a$06$fMcDq8KOop75ND1tOhgQuepiEdc0ceuML66vqxW8oERe5HqQZIzCa	teacher	2025-11-05 12:47:34.179085	\N	\N	4	30	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
75	Світлана Квак	kvak.svitlana@lnu.edu.ua	$2a$06$PyYxsCMQyDylfjjmVx4LIOR1oVRVGMu7xvIdI3tN9nnraOpqf/UR.	teacher	2025-11-05 12:47:34.179085	\N	\N	4	30	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
76	Оксана Марець	marets.oksana@lnu.edu.ua	$2a$06$dGtWNAJCWZ33ZK.DEx1gV.9R2zYYMIYjVUBMOmdZkjQR.e2/3M4ay	teacher	2025-11-05 12:47:34.179085	\N	\N	4	30	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
79	Валентина Марусяк	marusiak.valentyna@lnu.edu.ua	$2a$06$YHxStqz3cFwtJzUyOCweMe6.cIFfAjuoDAqm.GgGM/cSo8zoOmb5i	teacher	2025-11-05 12:47:34.179085	\N	\N	3	19	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
80	Антоніна Іваніна	ivanina.antonina@lnu.edu.ua	$2a$06$TW1kXKslVlk47y9PTE.Tj.Us7PPKVtJKfT6X79vtwyN4XEWFrnfLq	teacher	2025-11-05 12:47:34.179085	\N	\N	3	20	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
81	Лариса Генералова	heneralova.larysa@lnu.edu.ua	$2a$06$L9kdLDdmMKcr/ejz4g7JYeYt7KpntcJAxvo56ilZsTtesmE5DFwq2	teacher	2025-11-05 12:47:34.179085	\N	\N	3	20	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
82	Ярина Тузяк	tuziak.yaryna@lnu.edu.ua	$2a$06$AiAjnDu3DVQO6ke1cZHqcefnkyyfHbx7iBEQPYo2UDYRww6K85udu	teacher	2025-11-05 12:47:34.179085	\N	\N	3	20	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
83	Ірина Побережська	poberezhska.iryna@lnu.edu.ua	$2a$06$O1FxBzMU0oSOaVBRqNUCmemP6bAkmRu7H6OQE9g9BQi5Ml7/p.pO.	teacher	2025-11-05 12:47:34.179085	\N	\N	3	21	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
84	Олександр Костюк	kostiuk.oleksandr@lnu.edu.ua	$2a$06$KelGe29I7x0FqPdevc7lcOmmeohRn0lYHQ5sdYjJYLhby1VjsF61i	teacher	2025-11-05 12:47:34.179085	\N	\N	3	21	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
85	Леонід Скакун	skakun.leonid@lnu.edu.ua	$2a$06$wmEbRTkBOQdZ5g3yVxEOyu7uTHqnLDGeHDO7ATDFgDCk9A.O6RHh.	teacher	2025-11-05 12:47:34.179085	\N	\N	3	21	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
643	Олександра Шум’яцька	shumiatska.oleksandra@lnu.edu.ua	$2a$06$4NdDgrJ3KWds6u2dlnLqbOyrFjdTYHgpsL3H3qdKKHf3kMDlyyu5m	teacher	2025-11-05 13:13:21.680049	\N	\N	46	46	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
644	Наталія Ковалиско	kovalisko.nataliia@lnu.edu.ua	$2a$06$r6pdiihOfbrBNLS8BepwUO3p5CxLsKsiwNsGOB/nPYuTwY2DcqRMa	teacher	2025-11-05 13:13:21.680049	\N	\N	55	55	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
86	Степан Панчишин	panchyshyn.stepan@lnu.edu.ua	$2a$06$yHzSK7feWdflUvnR5KSfg.oaWaBbf19HI58Um5zUfMFBM/yskimBu	teacher	2025-11-05 12:47:34.179085	2025-11-05 12:47:54.592791	2025-11-05 12:48:33.198553	4	22	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
87	Ігор Крупка	krupka.ihor@lnu.edu.ua	$2a$06$RzHWjC.aWGh7GWnDU3dC1.lO8mjrHZ04QMm9blD/bZ98OdkJnvhYa	teacher	2025-11-05 12:50:24.062717	\N	\N	4	22	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
88	Лариса Зомчак	zomchak.larysa@lnu.edu.ua	$2a$06$o3RuajnoBLq.sMV76kdUzOOKlJdYcAwtK8PtFWsMJkTAlMXoam4Q2	teacher	2025-11-05 12:50:24.062717	\N	\N	4	24	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
89	Євген Майовець	maiovets.yevhen@lnu.edu.ua	$2a$06$QwStzJbyPoGu8MxZNxv1A.jOnz4qrliZqAQM9I6svMc/MNfc4bLHu	teacher	2025-11-05 12:50:24.062717	\N	\N	4	27	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
90	Інна Бойчук	boichuk.inna@lnu.edu.ua	$2a$06$X7uuxZiSgjzn9KCOSyiEZuS9ObBX9JBrkmJ17TElkffvWFLYsTb6q	teacher	2025-11-05 12:50:24.062717	\N	\N	4	27	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
91	Ірина Гнилякевич-Проць	hnylakevych-prots.iryna@lnu.edu.ua	$2a$06$SgqjtosJcJsdMXpddT9q8udKvX8AdyscQHvnc41AF3a/sgu.Ms38a	teacher	2025-11-05 12:50:24.062717	\N	\N	4	27	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
92	Олександр Кундицький	kundytskyi.oleksandr@lnu.edu.ua	$2a$06$qTp5/na8pgEREqMLuS5IH.kQjl4k0r6oPxFoYMDrp0fQCtNqnWbQW	teacher	2025-11-05 12:50:24.062717	\N	\N	4	28	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
93	Зорина Юринець	yuryne.ts.zorina@lnu.edu.ua	$2a$06$F59qcj35sC6hUJ.e9zDKB.JQBvHHit9ztNvJ.BHBUNzuR./avxZfa	teacher	2025-11-05 12:50:24.062717	\N	\N	4	28	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
94	Анна Грищук	hryshchuk.anna@lnu.edu.ua	$2a$06$BNCGFcY3r4nuNtodtbWi3OLbv9KmuRUqiBebKmFJomnt3RYAT.eYO	teacher	2025-11-05 12:50:24.062717	\N	\N	4	28	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
95	Оксана Жук	zhuk.oksana@lnu.edu.ua	$2a$06$6LMxqkUzXhKEpNuxkxmNnOOXD1rHLTTsbcoUciDYj/GgeUyUaDy06	teacher	2025-11-05 12:50:24.062717	\N	\N	4	28	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
96	Маріанна Павлишин	pavlyshyn.marianna@lnu.edu.ua	$2a$06$zDbiB60f/N2hE9qJ6Et2pu98WdGxYy6YDWdkHE69VsghwFLCz.qCm	teacher	2025-11-05 12:50:24.062717	\N	\N	4	28	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
97	Олексій Ковалюк	kovaliuk.oleksii@lnu.edu.ua	$2a$06$y2ahr.obvae.WSHEZhm9q.4602JTMUxxtzEtYyG.6sUlkP7rBMmNi	teacher	2025-11-05 12:50:24.062717	\N	\N	4	29	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
98	Євген Цікало	tsikalo.yevhen@lnu.edu.ua	$2a$06$5Qky5fYL4NN.6KljxDi6m.X1EBpiePgG8XxLk4u5WmSIHE3zhCyNy	teacher	2025-11-05 12:50:24.062717	\N	\N	4	29	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
99	Звенислава Бандура	bandura.zvenyslava@lnu.edu.ua	$2a$06$v/bcqIwCvgo1zJSbgVFKvesLV0dtw6P4uGm2TKLM2DJWOR0bndpVa	teacher	2025-11-05 12:50:24.062717	\N	\N	4	29	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
100	Ганна Головчак	holovchak.hanna@lnu.edu.ua	$2a$06$/dZevdKljIu3s3Uc7ky8me.27Ani3TnGsnrn8Vo/vYE8uAdYxtEL2	teacher	2025-11-05 12:50:24.062717	\N	\N	4	29	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
101	Ірина Демко	demko.iryna@lnu.edu.ua	$2a$06$iIFtKYdy9sabF6FTkYn2Ue05uFM7goTQ6BgUWj2vV2jYpNViMu096	teacher	2025-11-05 12:50:24.062717	\N	\N	4	29	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
102	Зоряна Тенюх	teniukh.zoriana@lnu.edu.ua	$2a$06$OFzv/Tfihj9sfr2WBpvW0uYXSJF6CpDDVxvBtRY2WTBuDgIoUjVgK	teacher	2025-11-05 12:50:24.062717	\N	\N	4	29	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
103	Надія Хоча	khocha.nadiia@lnu.edu.ua	$2a$06$g6vfz4RqmGsyElsDudqiXOJwDhUMGl5mRr5eRxslKmyQLhoht9Tnm	teacher	2025-11-05 12:50:24.062717	\N	\N	4	29	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
645	Наталія Черниш	chernysh.nataliia@lnu.edu.ua	$2a$06$DisOAeXa2coNkiv.WQv4Ae65ePjne9a040UfpOFpfdv3ARWle9one	teacher	2025-11-05 13:13:21.680049	\N	\N	55	55	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
78	Олег Крупич	krupych.oleh@lnu.edu.ua	$2a$06$FkbHNBSo7vo94DK16ZxZsuRkMlYiPH1MDnGlCqM4.jp83Hrm/lwMO	teacher	2025-11-05 12:47:34.179085	2025-11-06 11:51:30.513811	\N	5	32	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
104	Марта Дуфанець	dufanets.marta@lnu.edu.ua	$2a$06$3w4jJkQ65eeEoH0mp1Uvr.Lv3WVZC98IlYg2ehMSIciM/dUxq0R.S	teacher	2025-11-05 12:50:24.062717	2025-11-11 23:54:47.378425	2025-11-10 12:33:56.470476	5	32	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
110	Сергій Вельгош	velhosh.serhii@lnu.edu.ua	$2a$06$Z.0QgngOb06FUpaxZSXJo.pgoX6ukySKYLyiGPgMIIp.l5mAtOxXO	teacher	2025-11-05 12:50:24.062717	\N	\N	5	34	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
112	Іван Хвищун	khvyshchun.ivan@lnu.edu.ua	$2a$06$gctcAIqati0LPA7h/WVBuOx4BE5tZI.xNgFpzOtS2LPHOtd4CnhvO	teacher	2025-11-05 12:50:24.062717	\N	\N	5	34	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
117	Ігор Колич	kolych.ihor@lnu.edu.ua	$2a$06$21TiXI6dKRzs1mg8FJShr.jPIDH5LvH4wv/mN3RNYM7hIgZ1gmGsK	teacher	2025-11-05 12:50:24.062717	\N	\N	5	35	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
119	Богдан Цибуляк	tsybulak.bohdan@lnu.edu.ua	$2a$06$0RPcjEAAbqlSvmNHyFy7beU6CJngUaqdoPZAIbYMOwwP/AK0AnWwK	teacher	2025-11-05 12:50:24.062717	\N	\N	5	35	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
120	Ольга Квасниця	kvasnytsia.olha@lnu.edu.ua	$2a$06$okaukl60mCadA3SIVWgQS.eRMnKZEDM3JjHCa75o/qkzyLUrHVI/i	teacher	2025-11-05 12:50:24.062717	\N	\N	6	38	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
121	Юрій Мельник	melnyk.yurii@lnu.edu.ua	$2a$06$EBO1XdnBRgctk0iOaqfuXermM2YAO8.RPS6tpAJ4L5MFhhyesi7Ya	teacher	2025-11-05 12:50:24.062717	\N	\N	6	38	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
122	Марія Яцимірська	yatsymirska.mariia@lnu.edu.ua	$2a$06$OkJ9o8jM1QZSmXzu312bUeFz.dMvUhF4JvEF9GvPOBHJ8o/yNQ8hG	teacher	2025-11-05 12:50:24.062717	\N	\N	6	39	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
123	Анатолій Капелюшний	kapeliushnyi.anatolii@lnu.edu.ua	$2a$06$J1Piva.jf7yOGIAAC3hn/Of.qHExsbZi5SKQwd317t0XuyAeGLJwe	teacher	2025-11-05 12:50:24.062717	\N	\N	6	39	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
124	Марія Ріпей	ripej.mariia@lnu.edu.ua	$2a$06$Ta0OnV01Zfu1gYQVyYj/0.i7f04mFxATTCWaOsWzVdSj8kMZRM2Fa	teacher	2025-11-05 12:50:24.062717	\N	\N	6	39	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
125	Ігор Павлюк	pavliuk.ihor@lnu.edu.ua	$2a$06$kYUKotvDqa1p50EymJr2Eu2RsjT8WGwHCBK7wLu2ITcO5Cs31psRy	teacher	2025-11-05 12:50:24.062717	\N	\N	6	40	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
126	Ірина Процик	protsyk.iryna@lnu.edu.ua	$2a$06$Yd7CzoSXWmtbo28493Ge4eUzoTLBXn6tdV0SRpm612U.g6WfyLdBa	teacher	2025-11-05 12:50:24.062717	\N	\N	6	40	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
127	Тетяна Слотюк	slotiuk.tetiana@lnu.edu.ua	$2a$06$r7WUgB1OJMZCCVHlFOd/m.XT5wVLtaSPsaG8xAo/fnIKHyPudAKWK	teacher	2025-11-05 12:50:24.062717	\N	\N	6	40	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
128	Михайло Білінський	bilinskyi.mykhailo@lnu.edu.ua	$2a$06$yHJSzehdC8E.gKMs1YihOuwuyJygo/OBQMirwwZ5t3DfRLCSFxr/u	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
129	Ольга Барановська	baranovska.olha@lnu.edu.ua	$2a$06$pQkfYwpw/uQ23wu32Vx4OeQhMRsFxEi1VwkFsiCjuwauJIZVjHmOW	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
130	Тетяна Бублик	bublyk.tetiana@lnu.edu.ua	$2a$06$ldTLRPDRoYJNUv2pGcjGnOolg1naNGa0IIht38y2o/Q6qdxjBL9xO	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
131	Юлія Дацько	datsko.yuliia@lnu.edu.ua	$2a$06$u6LCpeZiN..TLqpze29LpOES2FE1Z3CvE8XHmwtZCj1ZCUQvSoK46	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
132	Ірина Ділай	dilai.iryna@lnu.edu.ua	$2a$06$kcfLxZV1VW3LUwXgaei48uzkn4VEXH2NAuT6By82xqsNtcAxAzCra	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
133	Уляна Зьомко	ziomko.uliana@lnu.edu.ua	$2a$06$hSEe8TO7kcTKi5uQkI/kR.Tt8D.FUMTE7pu1daiRsTK3JIYrmSPeO	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
134	Ігор Кондратішин	kondratyshyn.ihor@lnu.edu.ua	$2a$06$PHJOyW5DFKuNRAW/7dyHg.GOr2CP0GCJc3iLtdUr4sSmbMNzRM4Bi	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
135	Ольга Курпіль	kurpil.olha@lnu.edu.ua	$2a$06$lEqSHY9YxyNH10Rf.aTjL.HG8AriZYXK1pm2yrl41b07Qqe..LmMW	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
136	Наталя Нера	nera.natalia@lnu.edu.ua	$2a$06$n43fECL6Qcd4XeNa67PdJupBk8SUbLdyVpRIfTVuGtu9PGzvhHTm6	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
137	Тетяна Оршинська	orshynska.tetiana@lnu.edu.ua	$2a$06$7.u2F1UmqcH3DmWME24hAOz1oFSHU57iqG1p3MPKVLp.kEfuXxghK	teacher	2025-11-05 12:50:24.062717	\N	\N	7	41	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
138	Андрій Содомора	sodomora.andrii@lnu.edu.ua	$2a$06$D87Msiv6SnglYYmcaIg0qOFycH5/UxRn/fMBQCgrYXh1iNM2bcqmy	teacher	2025-11-05 12:50:24.062717	\N	\N	7	42	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
139	Роман Домбровський	dombrovskyi.roman@lnu.edu.ua	$2a$06$oc5gjObEsbzuDSY8vIpxQ.CDYoAh4sN7ZeWPqKOmS9AOgenzusplW	teacher	2025-11-05 12:50:24.062717	\N	\N	7	42	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
140	Христина Куйбіда	kuibida.khrystyna@lnu.edu.ua	$2a$06$GecPXRc0eYUWV0PTfBGf2O1OHaFYbxIDK9r73hLsek6bIGx4zgo4K	teacher	2025-11-05 12:50:24.062717	\N	\N	7	42	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
141	Роксоляна Оліщук	olishchuk.roksoliana@lnu.edu.ua	$2a$06$bCoYUcgtfWzlBZmv940CtuYzqGXVKoBcQY.5fiF1I0qrBuD.F/yYO	teacher	2025-11-05 12:50:24.062717	\N	\N	7	42	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
142	Олексій Сафроняк	safroniak.oleksii@lnu.edu.ua	$2a$06$Tj6UW0ml7I.YZMVYKvg.TeQHN.Lina/huTL82w0iaxOMpFTeuxNJ2	teacher	2025-11-05 12:50:24.062717	\N	\N	7	42	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
143	Богдан Максимчук	maksymchuk.bohdan@lnu.edu.ua	$2a$06$Uf6jgnoEsxToduFaensjg.gVu10m5tYVC2IzmhmiG7wsefpZK6B6C	teacher	2025-11-05 12:50:24.062717	\N	\N	7	43	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
144	Юрій Захаров	zakharov.yurii@lnu.edu.ua	$2a$06$L1mtZ1Bi97VQlmIU452FWOddL2vsrFyUVrdThQVInhCxa3qetMtyW	teacher	2025-11-05 12:50:24.062717	\N	\N	7	43	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
145	Ольга Крайник	krainyk.olha@lnu.edu.ua	$2a$06$buZlAUl0UDNkQvAQiSuZtOYg3zI9/XGemJ7vDuFsuQl6bmrZ2Mt7q	teacher	2025-11-05 12:50:24.062717	\N	\N	7	43	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
146	Тетяна Мідяна	midiana.tetiana@lnu.edu.ua	$2a$06$384NI9sgy/SzfJitDHsCYOWiWWKz1131ACfzoLW1aFd7jZ4H0Z90C	teacher	2025-11-05 12:50:24.062717	\N	\N	7	43	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
147	Тарас Пиц	pyts.taras@lnu.edu.ua	$2a$06$xfhVeFCTg2FIMNUqm1MsUuC8oUZ6fdSFfdP.JqecvJTPdKwedGH/K	teacher	2025-11-05 12:50:24.062717	\N	\N	7	43	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
148	Оксана Бабелюк	babeliuk.oksana@lnu.edu.ua	$2a$06$eBTeE/SLbNiL2n9bWlO9q.urI79Szn3S0qKsq5sdZ5nOsNaxZBAFC	teacher	2025-11-05 12:50:24.062717	\N	\N	7	44	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
149	Марія Заваринська	zavarynska.mariia@lnu.edu.ua	$2a$06$qHovRlfJIbRLe44sqQFfW.1onPZ7vpKkL3t33iKDie9qn7SuE7qum	teacher	2025-11-05 12:50:24.062717	\N	\N	7	44	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
150	Ярема Кравець	kravets.yarema@lnu.edu.ua	$2a$06$20iuLivi5FMFJEYsgOPDoeyp0M/u88LZmFDaWXupLMI5FYiuqbAJi	teacher	2025-11-05 12:50:24.062717	\N	\N	7	44	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
151	Надія Поліщук	polishchuk.nadiia@lnu.edu.ua	$2a$06$RW1UfLSU0JJTdNOF1SBrOeG6qhb6jnv297QITsgesog69bABCHUyK	teacher	2025-11-05 12:50:24.062717	\N	\N	7	44	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
152	Богдан Чернюх	cherniukh.bohdan@lnu.edu.ua	$2a$06$.QmOpBHH2rQcFDFObd.2.uXooLHDnPN1LBihIhJDYwbwd8TNy8xmG	teacher	2025-11-05 12:50:24.062717	\N	\N	7	45	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
153	Юлія Зелена	zelena.yuliia@lnu.edu.ua	$2a$06$MJbaXvyNPUvmFDgAZbrupekoxtiOLe0S/poffYjJ0Vp7heJDgsa2C	teacher	2025-11-05 12:50:24.062717	\N	\N	7	45	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
154	Христина Лесько	lesko.khrystyna@lnu.edu.ua	$2a$06$Co7V2IGND5CeAGTVEuHOvuKHukvU/YgcVJzaEI9WFXSa.UBRPWVI2	teacher	2025-11-05 12:50:24.062717	\N	\N	7	45	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
155	Ольга Маєвська	maievska.olha@lnu.edu.ua	$2a$06$t27wNCH5vWPRF5wRnYPKieDAu6.3hUNLqn1jPqa3m8qFHYfpq3mMm	teacher	2025-11-05 12:50:24.062717	\N	\N	7	45	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
156	Ярина Стецько	stetsko.yaryna@lnu.edu.ua	$2a$06$gZA5Euevw//E7pdFeKoXsOY3e8.uevDQ3EPw0k8bB2qeqjGIXlEd2	teacher	2025-11-05 12:50:24.062717	\N	\N	7	45	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
157	Ігор Цимбалістий	tsymbalistyi.ihor@lnu.edu.ua	$2a$06$fTxy6GsPoCn2L0.fpkGtVeEE/AwbStoTJzvf6lkKm1eVu9DrM.obK	teacher	2025-11-05 12:50:24.062717	\N	\N	7	45	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
158	Христина Дяків	diakiv.khrystyna@lnu.edu.ua	$2a$06$wNFjpa.KtFasu3jpDw7MQuI1iTVyn5Os/uEc4GVxrDJgHHv/AE7d6	teacher	2025-11-05 12:50:24.062717	\N	\N	7	46	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
159	Любомир Бораковський	borakovskyi.liubomyr@lnu.edu.ua	$2a$06$tn9p8J9nBD6IDqYOczjPL.FFULElptvwP53Xaylv2FipJmI102K8m	teacher	2025-11-05 12:50:24.062717	\N	\N	7	46	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
160	Тетяна Ляшенко	liashenko.tetiana@lnu.edu.ua	$2a$06$BseBJNFhuvSBrSGyo0c.Eum482d3Sunp21C4NU4h5NsvH4rSatzzy	teacher	2025-11-05 12:50:24.062717	\N	\N	7	46	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
161	Оксана Смеречинська	smerechynska.oksana@lnu.edu.ua	$2a$06$C99f8bxnaUyqEmKHAMmQWOj6mOaFfExSIJP0XM9wWOAFWj0g1jy3q	teacher	2025-11-05 12:50:24.062717	\N	\N	7	46	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
646	Орислава Калиняк	kalyniak.oryslava@lnu.edu.ua	$2a$06$YqmgjNvL2ER3UK3R3w4eBeOZTUTE5pwUvH5wgRUyIl9FKEQ28gKRa	teacher	2025-11-05 13:13:21.680049	\N	\N	55	55	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
111	Зіновій Любунь	liubun.zinovii@lnu.edu.ua	$2a$06$YIkwBECZqDVkMEaMuFa4ZOLaohSQpg9F7oELfgJGPVVP7RctEtcgu	teacher	2025-11-05 12:50:24.062717	2025-11-12 14:30:35.590476	\N	5	34	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
113	Олег Бугрій	buhrii.oleh@lnu.edu.ua	$2a$06$Ltf3LaVDEh0I5usms6/mvuI6pTOjANMFZN4yrnuiVzc8FqUyzKAiS	teacher	2025-11-05 12:50:24.062717	2025-11-12 13:38:08.24996	2025-11-12 13:01:58.094888	5	35	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
108	Михайло Павлик	pavlyk.mykhailo@lnu.edu.ua	$2a$06$jNsWTQjo6iYXd8OgfZbZv.sLYnp8HjKElwr/EZSDM8XWDCQ0zYcD6	teacher	2025-11-05 12:50:24.062717	2025-11-12 20:40:47.723514	\N	5	33	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
647	Ганна Кудринська	kudrynska.hanna@lnu.edu.ua	$2a$06$h0Lw9w/2Bp/Gxd/4rEqTGu4LjD1O4PSSm63Q/fsO45f5yEPgfJ4oi	teacher	2025-11-05 13:13:21.680049	\N	\N	55	55	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
648	Тетяна Марусяк	marusiak.tetiana@lnu.edu.ua	$2a$06$uss/ij1E0Huj0I/OjmKrDeW28bZVb3fmBJ0dsPwWGn4tNQNRmy74S	teacher	2025-11-05 13:13:21.680049	\N	\N	55	55	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
649	Роман Сілецький	siletskyi.roman@lnu.edu.ua	$2a$06$hvb7V9jwESJXQgQFTHBiDegd2I4GbUaaEKsL4y5vLGplhDWCmObau	teacher	2025-11-05 13:13:21.680049	\N	\N	52	52	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
650	Ігор Гілевич	hilevych.ihor@lnu.edu.ua	$2a$06$uuGZGmkP668LZ7BYkH802eCYe/8MfoUY4Qp1f/mT2iey4jOBacNP2	teacher	2025-11-05 13:13:21.680049	\N	\N	52	52	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
651	Григорій Рачковський	rachkovskyi.hryhorii@lnu.edu.ua	$2a$06$s81X7EEj3RehkIxgCIknB.gDvTRUjF6CJL13HvuLplMM3ffc.LEN6	teacher	2025-11-05 13:13:21.680049	\N	\N	52	52	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
652	Зоя Баран	baran.zoia@lnu.edu.ua	$2a$06$eOuK5h78QQ83cTcluSGD4Ox7Ebsj3JrkKvECFIFbE752QrMyJEbvC	teacher	2025-11-05 13:13:21.680049	\N	\N	50	50	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
653	Назар Васьків	vaskiv.nazar@lnu.edu.ua	$2a$06$S0F1jG9Us26isawpWiP8De9ciJ2J95ddQ4gzDYgFhr/aIKJZI1Jey	teacher	2025-11-05 13:13:21.680049	\N	\N	50	50	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
654	Богдана Сипко	sypko.bohdana@lnu.edu.ua	$2a$06$lw0.7hgmNj/MATZ7nGw1QeSxSTi8w6BhCynXMlofg8FXPQKa1zNf6	teacher	2025-11-05 13:13:21.680049	\N	\N	50	50	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
655	Наталія Турмис	turmys.nataliia@lnu.edu.ua	$2a$06$7ZXZOlA7x96v0FrMFjR83uzQd1CnbfuUeILgR486I9LKQ0PGtNbmK	teacher	2025-11-05 13:13:21.680049	\N	\N	50	50	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
656	Андрій Заяць	zaiats.andrii@lnu.edu.ua	$2a$06$6yDSLAIqw.1g9NPK7n2Yzu2FvK7yYhiUWE.uRfyn6zqqlZh7uulHm	teacher	2025-11-05 13:13:21.680049	\N	\N	48	48	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
174	Юрій Пачковський	pachkovskyi.yurii@lnu.edu.ua	$2a$06$qbYZNZ.jqQsYOsJB/ynmtOpJLagI0Y3p8C9SEFoRoYCGSDHJvBp5S	teacher	2025-11-05 12:54:38.389697	\N	\N	8	55	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
175	Олег Демків	demkiv.oleh@lnu.edu.ua	$2a$06$HcadWQUW14Lje44Rc1/REOjLwCIEXO.Ir54yVBezeyXBKtt4t02uW	teacher	2025-11-05 12:54:38.389697	\N	\N	8	55	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
176	Алла Середяк	serediak.alla@lnu.edu.ua	$2a$06$QpLsqbBfBYGD2A2a6b0J7OVrpyEkP0SReG2OrT.MBmbNykozb0XwC	teacher	2025-11-05 12:54:38.389697	\N	\N	8	53	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
177	Любов Кияновська	kyianovska.liubov@lnu.edu.ua	$2a$06$S82QhxxKibjYQL3R1k8BPOtZHnLhMomt0bbslGERybI/cyuq1Bfea	teacher	2025-11-05 12:54:38.389697	\N	\N	9	56	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
178	Ельвіра Тайнель	tainel.elvira@lnu.edu.ua	$2a$06$EaIqNDi32QmGjaX8MPSaIOpPRs.NN8zXCVOfyE.M2qXFkR9KyCFvS	teacher	2025-11-05 12:54:38.389697	\N	\N	9	56	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
179	Ольга Козаченко	kozaczenko.olha@lnu.edu.ua	$2a$06$eS4nrY01LX/r0hpBKgfd/.QrX58.5agpEF8oBA9fckjtcGHaJGi6u	teacher	2025-11-05 12:54:38.389697	\N	\N	8	55	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
180	Тетяна Лапан	lapan.tetiana@lnu.edu.ua	$2a$06$vLRrdxu.VYXGtZWvVZqN7elxnO9X9tCUPR2dcZv3IaqMCZ2sKjOHy	teacher	2025-11-05 12:54:38.389697	\N	\N	8	55	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
181	Володимир Галайчук	halaichuk.volodymyr@lnu.edu.ua	$2a$06$0HjrfFb6hL/EwYUBO03wA.KYtovpqVCa20hbdrhgY4VI2aPN/QRu.	teacher	2025-11-05 12:54:38.389697	\N	\N	8	52	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
182	Роман Тарнавський	tarnavskyi.roman@lnu.edu.ua	$2a$06$jdFATms2WBbe3vq977foCeAJI355C369ozpFuwmIjPdo77U.6Wx0C	teacher	2025-11-05 12:54:38.389697	\N	\N	8	52	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
183	Руслан Сіромський	siromskyi.ruslan@lnu.edu.ua	$2a$06$vop60D9SFzBjb49Fwzk8L.uUg2ZMpHmPo4kHUOJZFp8EiQoQRftH6	teacher	2025-11-05 12:54:38.389697	\N	\N	8	50	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
184	Андрій Козицький	kozytckyi.andrii@lnu.edu.ua	$2a$06$ohcOQ9bLYyB/3V5Fhg8lGeM0YxA8qGa6WYP0H9c0V8k/AQyVwe1YS	teacher	2025-11-05 12:54:38.389697	\N	\N	8	50	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
185	Олександр Целуйко	tselujko.oleksandr@lnu.edu.ua	$2a$06$IkKz8KEyL/U8ah0Wo24Iae3KPH0q7qht9fyG.9O69Rt0zXH8HGLcS	teacher	2025-11-05 12:54:38.389697	\N	\N	8	48	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
186	Роман Шуст	shust.roman@lnu.edu.ua	$2a$06$71CHIqiW6U8JPwxzHlsLq.bOootK01ruFCdpoKFRji.PnlUUkmF6a	teacher	2025-11-05 12:54:38.389697	\N	\N	8	48	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
187	Юрій Гудима	hudyma.yurii@lnu.edu.ua	$2a$06$FyxVAM0jDGoNAXGl8GaTjeql7x8wCzWZQ6Wy3pV/.Jt6Ymp31LGvm	teacher	2025-11-05 12:54:38.389697	\N	\N	8	48	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
188	Олег Дух	dukh.oleh@lnu.edu.ua	$2a$06$Reco.ZNybM7MhCy6KsIjLu1oU1AiJSjqBiuIZi/dXAQMk6hKHyIQ2	teacher	2025-11-05 12:54:38.389697	\N	\N	8	48	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
189	Роман Генега	heneha.roman@lnu.edu.ua	$2a$06$iIlPd/J0KDBwl0G5bOOXYujsE4TggF1zdMoGQj3RAHELyqcNTGRCe	teacher	2025-11-05 12:54:38.389697	\N	\N	8	53	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
190	Ігор Мрака	mraka.ihor@lnu.edu.ua	$2a$06$g2n/EBrdvBPsbMDD74UGgeJwMlirFY5mHe/fTLznttaJUz7nY7bVa	teacher	2025-11-05 12:54:38.389697	\N	\N	8	53	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
191	Оксана Величко	velychko.oksana@lnu.edu.ua	$2a$06$MytHpEUY/NCwXRHK6rSxQezeMB.XKYsc/JlkrjMre0Ld1JECLUfwa	teacher	2025-11-05 12:54:38.389697	\N	\N	9	56	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
192	Лілія Гринь	hryn.liliia@lnu.edu.ua	$2a$06$X6CmBd2z.foyXzdCusQSJOe/KbkY42hROvL9XqDuomLnYs2ZI617.	teacher	2025-11-05 12:54:38.389697	\N	\N	9	56	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
193	Зоряна Жигаль	zhyhal.zoriana@lnu.edu.ua	$2a$06$qeKUffA/EBg3CbBGTq.pN.Lw29/eRkUZj8NJvdF.UrK.MSCTimgoS	teacher	2025-11-05 12:54:38.389697	\N	\N	9	56	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
194	Андрій Дем'янчук	demiianchuk.andrii@lnu.edu.ua	$2a$06$ymwYT1retRjRxDg1SbcDgeLvnGkY/jmcSSbNEU24NA4o1rPiG56ga	teacher	2025-11-05 12:54:38.389697	\N	\N	9	59	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
195	Роман Лаврентій	lavrentii.roman@lnu.edu.ua	$2a$06$KBlLnTzQAKI.JYu0DBSYLu5cXpDgbtrzBX3IpKIV9mW1BxHOwoEZ.	teacher	2025-11-05 12:54:38.389697	\N	\N	9	59	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
196	Михайло Симотюк	symotiuk.mykhailo@lnu.edu.ua	$2a$06$K8DfGJea/9/rFz/LUiKy8u8MW7EGfZjjhRB7buJ01S3VA/bNNv7Mu	teacher	2025-11-05 12:54:38.389697	\N	\N	10	67	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
197	Оксана Холявка	kholiavka.oksana@lnu.edu.ua	$2a$06$Ud.3bItoPE1rRXwpFvT0m.mw0e2domkiDg6rYGU1j8MAt3YqEqfNC	teacher	2025-11-05 12:54:38.389697	\N	\N	10	67	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
198	Володимир Станкевич	stankevych.volodymyr@lnu.edu.ua	$2a$06$55xg1Bzu0KpYP3aqqjzxP.AODIbTg7DwHsy1ozbOf//RtAPhQxtRW	teacher	2025-11-05 12:54:38.389697	\N	\N	10	68	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
199	Іван Звізло	zvizlo.ivan@lnu.edu.ua	$2a$06$Wva0E9Gcit.dqWDJDHTvfOW61nIwzxiA33YguXk73UIJQKYZRwdQe	teacher	2025-11-05 12:54:38.389697	\N	\N	10	68	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
200	Наталія Яджак	yadzhak.nataliia@lnu.edu.ua	$2a$06$J1UMn1sPPrdFK2WyVjGK8ePjBwNV8H5cd5iC9yGl4d9L5qe3Xh07.	teacher	2025-11-05 12:54:38.389697	\N	\N	10	68	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
201	Оксана Головата	holovata.oksana@lnu.edu.ua	$2a$06$PL9falPXH2bGDDK.4p7Ume7bcvwgtFGmt76OX4qxCDcdCQf5pBz..	teacher	2025-11-05 12:54:38.389697	\N	\N	10	66	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
202	Тарас Кудрик	kudryk.taras@lnu.edu.ua	$2a$06$BJtv9xvqpVTKeeofAJZwMexZd7R/N.FvxeTrluizCsNRqIvnXdb2G	teacher	2025-11-05 12:54:38.389697	\N	\N	10	66	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
203	Ярослав Притула	prytula.yaroslav@lnu.edu.ua	$2a$06$.EF/2uUj52NJrh4xhJUeLeVv0c9NPscwXfco//.XvwHkRpXHo1Awi	teacher	2025-11-05 12:54:38.389697	\N	\N	10	66	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
204	Юрій Трухан	trukhan.yurii@lnu.edu.ua	$2a$06$lLIMy37eJxW70v.HJM3De.EJgPOhl.ArcnozGah20xrY2acZtcpBa	teacher	2025-11-05 12:54:38.389697	\N	\N	10	66	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
205	Тарас Радул	radul.taras@lnu.edu.ua	$2a$06$h/ootoltzYJBhAqlSLqw8OswRTKBqa09EnzJVmvKNJgXAYtyrtRq2	teacher	2025-11-05 12:54:38.389697	\N	\N	10	60	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
206	Вікторія Бридун	brydun.viktoriia@lnu.edu.ua	$2a$06$xHVYaWgce5F1.eAaRFZUkeiyYwJCF8Lhw1kPpAOyXsxrSSJMZbTYe	teacher	2025-11-05 12:54:38.389697	\N	\N	10	60	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
207	Юрій Іщук	ishchuk.yurii@lnu.edu.ua	$2a$06$DpaOHOBZe6.8AIEzR4HUF.OwsCsEmooN5kpuUolqQw8ZHa5KFugEC	teacher	2025-11-05 12:54:38.389697	\N	\N	10	60	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
208	Іванна Мельник	melnyk.ivanna@lnu.edu.ua	$2a$06$eAsRLWByqJDHCg6Zy0iodOCPyGCcXcrTUijIXQvIiLIDyT5ZM8V2K	teacher	2025-11-05 12:54:38.389697	\N	\N	10	60	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
209	Ірина Маковецька	makovetska.iryna@lnu.edu.ua	$2a$06$HJ4QrQiX0gYzWgd4ywNXAuroXpaDcy2LFcpvQJTJ2eiaNLDDYjWa2	teacher	2025-11-05 12:54:38.389697	\N	\N	9	56	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
210	Роман Берест	berest.roman@lnu.edu.ua	$2a$06$JiGzSsKH5psKyDcYsZIp3.l1.iZwAYdvmDdLiTxjuP63WVRUVAkt2	teacher	2025-11-05 12:54:38.389697	\N	\N	9	57	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
211	Роман Одрехівський	odrekhivskyi.roman@lnu.edu.ua	$2a$06$.jAcShontX9MNAMTW4wo1eOgRg5BD.D9CkaSChpsuCnrJJ0PH1YPO	teacher	2025-11-05 12:54:38.389697	\N	\N	9	57	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
212	Руслан Кундис	kundys.ruslan@lnu.edu.ua	$2a$06$IMr2Oqviey8uNOOQ.O0uTuI4JpfnbRdJj6O19osM6QTb6PemiPhwi	teacher	2025-11-05 12:54:38.389697	\N	\N	9	57	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
213	Петро Луньо	lunio.petro@lnu.edu.ua	$2a$06$5Q2opCu151ZjRdypejXifuRADrZTI26T6M/NKi7/ICug9.NlfNica	teacher	2025-11-05 12:54:38.389697	\N	\N	9	57	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
214	Людмила Белінська	belinska.lyudmyla@lnu.edu.ua	$2a$06$Ud2uaAn/2dJdmoRbdE.hxersvpObZwyYC/acvK/uAWHTECPPRQ7Gm	teacher	2025-11-05 12:54:38.389697	\N	\N	9	58	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
215	Максим Максимчук	maksymchuk.maksym@lnu.edu.ua	$2a$06$VJEJ2TQXVJwD0blIldrICOhEOR0/a/7s3a5wQYoQAgBaomGioGscm	teacher	2025-11-05 12:54:38.389697	\N	\N	9	58	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
216	Лілія Сирота	syrota.liliia@lnu.edu.ua	$2a$06$FJ/48T9/En6cCPYOCYm6b.ypnxpBQDxRKLR9H809Ru5hBtDh7Bgye	teacher	2025-11-05 12:54:38.389697	\N	\N	9	58	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
217	Любов Боровська	borovska.liubov@lnu.edu.ua	$2a$06$NgpbfMKfA2.LxwBfTTmpEO6WOhITxUxNFoCfA1OwDLX4YpU9LOzR.	teacher	2025-11-05 12:54:38.389697	\N	\N	9	59	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
218	Ольга Гапа	hapa.olha@lnu.edu.ua	$2a$06$sMI0tLqZsGn.rmYBv2PmPebs4NfyJw3Wo1GZHqHFSsqiOV8gOH8wO	teacher	2025-11-05 12:54:38.389697	\N	\N	9	59	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
219	Володимир Кучинський	kuchynskyi.volodymyr@lnu.edu.ua	$2a$06$j2W8tvGfeJW0Dvi355NqrOdv1KJwNxIQlmN7/q9XJKjPWdfab6GD2	teacher	2025-11-05 12:54:38.389697	\N	\N	9	59	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
221	Олександр Максимук	maksymuk.oleksandr@lnu.edu.ua	$2a$06$j7CeBW2BP4Q7RvRSf/j63uAKOTu..jHmzEupCIC6DP54dmhUYh5nq	teacher	2025-11-05 12:54:38.389697	\N	\N	10	69	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
222	Оксана Жумік	zhumik.oksana@lnu.edu.ua	$2a$06$HTZpj5gvav2Nubqn6J.AKuAwGq7BfhRGS4ZZjsbRFuRlhXo4sKK5O	teacher	2025-11-05 12:54:38.389697	\N	\N	10	69	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
223	Ольга Мильо	milio.olha@lnu.edu.ua	$2a$06$pa4jEMaoKKujNQ7lqzwbSe7fybRFSiHJ8ssTeEXPbSxtjHDiS4Fri	teacher	2025-11-05 12:54:38.389697	\N	\N	10	69	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
224	Людмила Стахів	stakhiv.lyudmyla@lnu.edu.ua	$2a$06$M5sGu0mGBhRFFRFenqovAeFXIxm6lzmtFz790/Qq0G3MwXpdzIrZ.	teacher	2025-11-05 12:54:38.389697	\N	\N	10	69	\N	\N	f	\N	2025-11-05 12:54:38.389697	\N	\N	\N	\N
225	Микола Бокало	bokalo.mycola@lnu.edu.ua	$2a$06$N3oBq4EBIkGWBRdBldWC8.gNOnRs2KfvS7Y4wpfwF6/yaX5qiKoFi	teacher	2025-11-05 12:57:42.152688	\N	\N	10	67	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
226	Галина Лопушанська	lopushanska.halyna@lnu.edu.ua	$2a$06$.UatFhqzWy3w6JGbWRmfg.zhR7ydxQXtEILDlhNetxn48EdppdOc.	teacher	2025-11-05 12:57:42.152688	\N	\N	10	67	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
227	Віталій Власов	vlasov.vitalii@lnu.edu.ua	$2a$06$UlFNLdIbVDHTqbcnI0oZIefWt3jq6EgLRTWL3NUlulbl.hWv2exLm	teacher	2025-11-05 12:57:42.152688	\N	\N	10	67	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
228	Василь Буляк	buliak.vasyl@lnu.edu.ua	$2a$06$4iFjOy4qRT9TvlQSJetAf.Hlx0ujFkSPb1fWCOK/ivgl54WY0J8ha	teacher	2025-11-05 12:57:42.152688	\N	\N	4	22	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
229	Михайло Мікієвич	mikijevych.mykhailo@lnu.edu.ua	$2a$06$zQu.GhHQ8tIl0yZw8aBehexY2sHJSkzmMaD1Kbww3hmcOwah9whtC	teacher	2025-11-05 12:57:42.152688	\N	\N	11	76	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
230	Ірина Іваночко	ivanchko.iryna@lnu.edu.ua	$2a$06$d07jsmkT8Z/MVw2SKoIDQONrRz67InplH7D2EBQ5TW3YUnkSW6kIu	teacher	2025-11-05 12:57:42.152688	\N	\N	11	76	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
231	Наталія Сорока	soroka.nataliia@lnu.edu.ua	$2a$06$YwrujUlBNeUo/5BQDbdJTexjS1DECLPpHBrllzuVycvfHh53PmWmq	teacher	2025-11-05 12:57:42.152688	\N	\N	11	76	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
232	Мар'яна Федунь	fedun.mariana@lnu.edu.ua	$2a$06$YPJBEiLqMsPUHdy9t.FWHe6uJN/4J1Lm5lJVY4ux64rRd5zcV0VQ2	teacher	2025-11-05 12:57:42.152688	\N	\N	11	76	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
233	Ірина Киянка	kyianka.iryna@lnu.edu.ua	$2a$06$ctqsUbZW2zTTkxbmVrdpb.9IJoUAMDKWVvvjE/vWVOjxqWaE4Og/6	teacher	2025-11-05 12:57:42.152688	\N	\N	11	74	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
236	Світлана Пик	pyk.svitlana@lnu.edu.ua	$2a$06$9UVh7toICsMBUXs0u5o6K.qCR0MuZrCcP8onG3DHNWoYpEhxTiVvG	teacher	2025-11-05 12:57:42.152688	\N	\N	11	74	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
237	Ігор Грабинський	hrabynskyi.ihor@lnu.edu.ua	$2a$06$/YkrT3XA1/30dV5oY/btn.tDrMcu4Mj0OLO7wNugCkqn5RlEp9spG	teacher	2025-11-05 12:57:42.152688	\N	\N	11	71	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
238	Григорій Шамборовський	shamborovskyi.hryhorii@lnu.edu.ua	$2a$06$BPWvKjlYRucopnU1ZNB0P.yVY7LUjXWM02LZ90LUjoUodTnQMnjP6	teacher	2025-11-05 12:57:42.152688	\N	\N	11	71	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
239	Маріанна Біда	bida.marianna@lnu.edu.ua	$2a$06$g8siWFhFh92XR1k1Xa.55uB865gGi3QtM1Rz85VyFEkIJ78ocTZSS	teacher	2025-11-05 12:57:42.152688	\N	\N	11	71	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
240	Соломія Огінок	ohinok.solomiia@lnu.edu.ua	$2a$06$mHVwbASV6IJ3csslZxTn3ev8BKeN0gAA0fQtoVTsXTaWvnEpQJXOa	teacher	2025-11-05 12:57:42.152688	\N	\N	11	71	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
241	Віталій Гутник	gutnyk.vitalii@lnu.edu.ua	$2a$06$9cPfSCh1bIcoGzhW.jRw5eTNS2yIf59dFmoVbnc/2bcsz2nt3bqKC	teacher	2025-11-05 12:57:42.152688	\N	\N	11	70	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
242	Володимир Гринчак	hrynchak.volodymyr@lnu.edu.ua	$2a$06$8laW3xmw63zEjI96eHxwsOTPqNggk9OQ9fIJTNC58KAR4SGhNqTiu	teacher	2025-11-05 12:57:42.152688	\N	\N	11	70	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
243	Вікторія Кузьма	kuzma.viktoriia@lnu.edu.ua	$2a$06$uVkJmDWl8TxHD0HlFelBpONyv09mijg18GRgnucVMrpkYz/dph.L6	teacher	2025-11-05 12:57:42.152688	\N	\N	11	70	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
244	Вікторія Малига	malyha.viktoriia@lnu.edu.ua	$2a$06$5Iy1jHdMACjHiIjlKOZsLORWaepmq4HyQEPZm1p0vPGNmG3M7TSbi	teacher	2025-11-05 12:57:42.152688	\N	\N	11	70	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
245	Мар'яна Бігус	bihus.mariana@lnu.edu.ua	$2a$06$z70SHV3PH/XEeRqgHzVlxeIp9/5s0873JSUResLK.ksWbnLBPWpZ2	teacher	2025-11-05 12:57:42.152688	\N	\N	11	75	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
246	Марія Кут	kut.mariia@lnu.edu.ua	$2a$06$zrs7eRCPyc8vVoZ7xQZ/kemJNf/.lYxeFMEGXR3f65OYhLX/r7LoK	teacher	2025-11-05 12:57:42.152688	\N	\N	11	75	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
247	Наталія Стручок	struchok.nataliia@lnu.edu.ua	$2a$06$nSg1zSq2s6nTcgHcPaTfauZH3bt9K8e0dlhqGqRuso72GyvC.SCXa	teacher	2025-11-05 12:57:42.152688	\N	\N	11	75	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
248	Ольга Біляковська	biliakovska.olha@lnu.edu.ua	$2a$06$2k5LeMlbKEiZ0tSokIVX7OKKOHuI73LRS6nwPKcL8UnNljqET9urC	teacher	2025-11-05 12:57:42.152688	\N	\N	12	77	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
249	Галина П'ятакова	piatakova.halyna@lnu.edu.ua	$2a$06$HmynqUhWtIfCkfK6yPRm.u1trFn1IpSBANuXiCc11OukIegaiddUC	teacher	2025-11-05 12:57:42.152688	\N	\N	12	77	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
250	Наталія Горук	horuk.nataliia@lnu.edu.ua	$2a$06$zzC8BKSxb9ZF8XGXO0buAO0.nx0zXJYhXEUJDTnaBWD/t9DD42Pdu	teacher	2025-11-05 12:57:42.152688	\N	\N	12	77	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
251	Надія Заячківська	zaiachkivska.nadiia@lnu.edu.ua	$2a$06$n4w2L2zGut9mtees0YCgk.BsmEiAyNS6NizTfQ8ufP7b1lT4Uwb1e	teacher	2025-11-05 12:57:42.152688	\N	\N	12	77	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
252	Оксана Ковалишин	kovalyshyn.oksana@lnu.edu.ua	$2a$06$pF6VFalFNfI4OhXI0Fj6huv8kSLmPEUIrJjcENU.Wxp5QFlhY0Aau	teacher	2025-11-05 12:57:42.152688	\N	\N	12	77	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
253	Наталія Мачинська	machynska.nataliia@lnu.edu.ua	$2a$06$EqMnoQUG5ycf6UOnk9PSDeD70s2oYWzgR83/LfSbwcB1SvbuQ8gmy	teacher	2025-11-05 12:57:42.152688	\N	\N	12	78	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
254	Олександра Білан	bilan.oleksandra@lnu.edu.ua	$2a$06$49HKyy1Kp4oSp6L/JDrLvuc7G5ecwImNiMwTTDaZbGLoiJlt/y4hu	teacher	2025-11-05 12:57:42.152688	\N	\N	12	78	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
255	Анна Войтович	voitovych.anna@lnu.edu.ua	$2a$06$SJIpbAzcpC/7iCpIS.5pFOKY1K8IUtRUhXuAo87uzWzBKgI.1XmDa	teacher	2025-11-05 12:57:42.152688	\N	\N	12	78	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
256	Валентина Деленко	delenko.valentyna@lnu.edu.ua	$2a$06$JveC2lr/5byyuE8Ftw0sBupqfjyeWkKTZcMXBqqsEigeV09F4nMuO	teacher	2025-11-05 12:57:42.152688	\N	\N	12	78	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
257	Світлана Кость	kost.svitlana@lnu.edu.ua	$2a$06$zLwIFarDJGzxMh2iZHchIe/ctkAQGdbO3Yrz56/h.23DBpg6CCz/6	teacher	2025-11-05 12:57:42.152688	\N	\N	12	78	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
258	Олена Лущинська	lushchynska.olena@lnu.edu.ua	$2a$06$YFaxGJeGQ1R0DdZp2bxgz.j4IiDfUHDIF9u9sSIbUyU69t.TGOaIG	teacher	2025-11-05 12:57:42.152688	\N	\N	12	78	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
259	Ярослав Бордян	bordian.yaroslav@lnu.edu.ua	$2a$06$TswCqtUY2bHj8IfKSCIWguhYYKwegLsanB503JOM8aRWQCOQv9fUq	teacher	2025-11-05 12:59:28.40274	\N	\N	12	79	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
260	Леся Мартіросян	martirosian.lesia@lnu.edu.ua	$2a$06$QqEGwnjssDbCDW.HbjJ0aOPH1z79NqL62UwoIj4965Om273s01xmG	teacher	2025-11-05 12:59:28.40274	\N	\N	12	79	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
261	Ірина Субашкевич	subashkevych.iryna@lnu.edu.ua	$2a$06$pvrCfXZ01fm0YJcaRe87beV6MghRvt2n2I53Bfh/nMvDxRdQiFGBy	teacher	2025-11-05 12:59:28.40274	\N	\N	12	79	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
262	Микола Притула	prytula.mycola@lnu.edu.ua	$2a$06$6iHKrUYoVBk2b9SBnR.HRehk1WWG/wa06kTRU5VgVhPtzUE/MlMBm	teacher	2025-11-05 12:59:28.40274	\N	\N	13	88	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
263	Роман Олійник	oliinyk.roman@lnu.edu.ua	$2a$06$6yAkDE0SI0fAqmERSb6Qg.0RnW77EOA.ufFt51L4ofWjipOHDW1Ce	teacher	2025-11-05 12:59:28.40274	\N	\N	13	88	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
264	Віталій Горлач	horlach.vitalii@lnu.edu.ua	$2a$06$hsl8tAdAVhRDGwuhmxco8ejL105Pm9PjBkmaQC5JLH6DL07w7GMJC	teacher	2025-11-05 12:59:28.40274	\N	\N	13	86	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
265	Григорій Жолткевич	zholtkevych.hryhorii@lnu.edu.ua	$2a$06$KN8a.siA61mqGa4WEAgH5eSU8uTt5ZyBC4IEenhCvO7dBR/B44mFG	teacher	2025-11-05 12:59:28.40274	\N	\N	13	86	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
267	Ірина Бернакович	bernakovych.iryna@lnu.edu.ua	$2a$06$njLO0argEUiuWGnnaGgvKeaaZsuZE8U5RHpix3LkXMglhV2ML.CR6	teacher	2025-11-05 12:59:28.40274	\N	\N	13	86	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
268	Роман Дреботій	drebotii.roman@lnu.edu.ua	$2a$06$fmL44lhwqf8kw4SdSo20.Oj/OR5nHujdWBkKHie4gTXT2BfNZKZHC	teacher	2025-11-05 12:59:28.40274	\N	\N	13	86	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
269	Олена Винокурова	vynokurova.olena@lnu.edu.ua	$2a$06$anIequ2BtjpvOIjTPemQFeqCO2.M4meShTbQuh9TfzBnLIk9WiBe2	teacher	2025-11-05 12:59:28.40274	\N	\N	13	89	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
270	Сергій Євсеєв	yevseiev.serhii@lnu.edu.ua	$2a$06$8DpfT9/h3GGD2ojXizmbUehBXGjsAN7k0h3XrvEf0Xgka5t/hAQf.	teacher	2025-11-05 12:59:28.40274	\N	\N	13	89	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
271	Дмитро Пелешко	peleshko.dmytro@lnu.edu.ua	$2a$06$crXVzw6CJkzH8PGS/JYtYuHUVsIcSa8RBN9nwu6gD.GXCz8vFXPPe	teacher	2025-11-05 12:59:28.40274	\N	\N	13	89	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
272	Олег Гутік	hutik.oleh@lnu.edu.ua	$2a$06$neiPgzaj9K5P//hgUMCYIO7M/cuMTIt.T35RBp47EH0iz3nQ5g.cG	teacher	2025-11-05 12:59:28.40274	\N	\N	13	89	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
273	Марина Костяк	kostiak.maryna@lnu.edu.ua	$2a$06$XPEBM9OhsrAaP2zOTr4yluGF5lrJl7FtLk1Pst2wIDFHom8/1683S	teacher	2025-11-05 12:59:28.40274	\N	\N	13	89	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
274	Юрій Ящук	iashchuk.yurii@lnu.edu.ua	$2a$06$y5gmdOPca8DEveDAYrKswOa49nkAEVSf1akiZpw9FOYTcCq9IWx0m	teacher	2025-11-05 12:59:28.40274	\N	\N	13	83	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
275	Василь Білецький	biletskyi.vasyl@lnu.edu.ua	$2a$06$UKD0IrN0189U0tLk/qwa6epUGO4.sLEmSVZc8aF1sQIFetZP1Ad6i	teacher	2025-11-05 12:59:28.40274	\N	\N	13	83	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
276	Віталій Кухарський	kukharskyi.vitalii@lnu.edu.ua	$2a$06$V2eCo5FwPV6MP43jdSuWxuF9vaHlbLZXK84e97j.1zWCnLtzB0u8S	teacher	2025-11-05 12:59:28.40274	\N	\N	13	83	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
277	Андрій Стягар	stiahar.andrii@lnu.edu.ua	$2a$06$gvJWWaNc74ZaU3IWgWlKNOXi8LaE7CvVM41k6BivI.k0I/EzA06rK	teacher	2025-11-05 12:59:28.40274	\N	\N	13	83	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
278	Сергій Ярошко	iaroshko.serhii@lnu.edu.ua	$2a$06$Ny2mLwPvJcBQVlnErM0giODSK.3qFstzHDDoN383Dqv8eM/a.lRj2	teacher	2025-11-05 12:59:28.40274	\N	\N	13	85	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
279	Олександр Вовк	vovk.oleksandr@lnu.edu.ua	$2a$06$lwugbPW85VCaigx8srmHo.7ICtQJDiYTvHqctLIADhWLIDu5sSD2C	teacher	2025-11-05 12:59:28.40274	\N	\N	13	85	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
280	Богдан Гошко	hoshko.bohdan@lnu.edu.ua	$2a$06$Sm0o5jP62xzlU6OwzjjJHOL/uyQs3f4w0v7VhyJJRkRec4118Levq	teacher	2025-11-05 12:59:28.40274	\N	\N	13	85	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
281	Наталія Івасько	ivasko.nataliia@lnu.edu.ua	$2a$06$KU10EXsY8iOUs4H7lYbzhuOy.qAZg/ydpxC4TcDxalbFqI8J0c/CO	teacher	2025-11-05 12:59:28.40274	\N	\N	13	85	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
282	Святослав Літинський	lytynskyi.sviatoslav@lnu.edu.ua	$2a$06$ShnQb/vOU8rVHeGZLJtYl.Fs/4HcauIllMRTTr8LtBJEpDERP3TLu	teacher	2025-11-05 12:59:28.40274	\N	\N	13	85	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
284	Роман Селіверстов	seliverstov.roman@lnu.edu.ua	$2a$06$NsqgUrUI1rQo/tpShqhow.Rbs2.er3ndmQaqgLI6NcK7jmIKIR5GS	teacher	2025-11-05 12:59:28.40274	\N	\N	13	85	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
285	Тетяна Соляр	soliar.tetiana@lnu.edu.ua	$2a$06$9tpNxE7WinFua2Uuoth9Su.VoRkALVCURBeageHXbM6U3OfbtJPCK	teacher	2025-11-05 12:59:28.40274	\N	\N	13	85	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
286	Галина Возняк	vozniak.halyna@lnu.edu.ua	$2a$06$g6IMgPQY1Da4pzyOOLiolexjpAMi4.sVcIJ/RPREH/.som51rmieW	teacher	2025-11-05 12:59:28.40274	\N	\N	14	90	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
287	Ольга Руденко	rudenko.olha@lnu.edu.ua	$2a$06$Sg2trFlVDA2XkVdUjF/ri.Jay0c1lmySTbQv9BjxifBCmE3zdSfRi	teacher	2025-11-05 12:59:28.40274	\N	\N	14	90	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
288	Олег Жук	zhuk.oleh@lnu.edu.ua	$2a$06$RcW.s06UxZ/RAbSjo2t4Xej6I.a3G4Y9bBRAN0Ns7Uj38v8HVcioe	teacher	2025-11-05 12:59:28.40274	\N	\N	14	90	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
289	Оксана Нагорнюк	nahrorniuk.oksana@lnu.edu.ua	$2a$06$brbub8nVeKPmjwO9k2.7WeRz2.0zbNY1crkdalYqkvmf/UwjTwj4O	teacher	2025-11-05 12:59:28.40274	\N	\N	14	90	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
290	Людмила Петришин	petryshyn.lyudmyla@lnu.edu.ua	$2a$06$hJjZ.213riVtTrWgs1sZLOV0yjDXWK/4dnLmK968P32uyHRWKIJk.	teacher	2025-11-05 12:59:28.40274	\N	\N	14	91	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
291	Світлана Гончарук	honcharuk.svitlana@lnu.edu.ua	$2a$06$tqUo9WBM4jxw1vy3k6ylV.K0HG5STQ/reZNaNGrScmBU9rhFrKtJm	teacher	2025-11-05 12:59:28.40274	\N	\N	14	91	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
292	Любов Шевців	shevtsiv.liubov@lnu.edu.ua	$2a$06$irLJ9ygVnLf234Wfv14T1OuojB9yn1QnooXrdHd0vKJrfDpsXdHmi	teacher	2025-11-05 12:59:28.40274	\N	\N	14	91	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
293	Ольга Вовчак	vovchak.olha@lnu.edu.ua	$2a$06$NONlPd6v4bSaGKf4UKALtuBXIP9ONEeZTbcdC3eAOnVNGEkdL6fH2	teacher	2025-11-05 12:59:28.40274	\N	\N	14	93	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
294	Віра Другова	druhova.vira@lnu.edu.ua	$2a$06$l3R4tyMFFXL.vRuU5uy48uoxGCFUfj4VG9WkCaDmjwQ1Lyo0qaF36	teacher	2025-11-05 12:59:28.40274	\N	\N	14	93	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
295	Ірина Тяжкороб	tiazhkorob.iryna@lnu.edu.ua	$2a$06$3dAOyzuSVNFfuOAVTKcqG.tMfILcf0J9/j8VIcUaMmlgcYBjRlmTK	teacher	2025-11-05 12:59:28.40274	\N	\N	14	93	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
296	Ігор Назаркевич	nazarkevych.ihor@lnu.edu.ua	$2a$06$Gnnptbywg09l8Jdb4Ff33OP9zfTXKhFiqmVZV0hMlk29OuMKCutZa	teacher	2025-11-05 12:59:28.40274	\N	\N	14	94	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
297	Юрій Голинський	holynskyi.yurii@lnu.edu.ua	$2a$06$xZpFaBNmVGAD0ceP50lVgOJjUNo8NNzPFrepXX1TEI1VdLwiQQrAq	teacher	2025-11-05 12:59:28.40274	\N	\N	14	94	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
298	Вікторія Дубик	dubyk.viktoriia@lnu.edu.ua	$2a$06$5zvQhT8nFNwldV5StO8XYu9zmYCKpnsXzDX1LZLhR79Pj5aOHsD1G	teacher	2025-11-05 12:59:28.40274	\N	\N	14	94	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
299	Ольга Клепанчук	klepanchuk.olha@lnu.edu.ua	$2a$06$15Xjyp2HpYumuN5LTQh86OnNV6q0TO4m.IKN1M6ZXYyoELgEZNTDC	teacher	2025-11-05 12:59:28.40274	\N	\N	14	94	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
300	Зоряна Лапішко	lapishko.zoriana@lnu.edu.ua	$2a$06$iBobkDPB6JgmacXP31lZUO2qnKfi/.pagAFgYqcqBscbJDya3jTEO	teacher	2025-11-05 12:59:28.40274	\N	\N	14	94	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
301	Любов Петик	pytyk.liubov@lnu.edu.ua	$2a$06$uUlfFILJmvQUpb61rQsHUeBfX8AjSDz0JW65RCPhmqK8QGJI/Bl/e	teacher	2025-11-05 12:59:28.40274	\N	\N	14	94	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
302	Анна Задорожна	zadorozhna.anna@lnu.edu.ua	$2a$06$gcxl2A07D9rhYa3jm8IoX.rXjHWQBoO/rQyKwvX7Hh/gOL5eHeDp.	teacher	2025-11-05 12:59:28.40274	\N	\N	14	95	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
303	Ігор Романич	romanych.ihor@lnu.edu.ua	$2a$06$NoXQF9ESGV4PTSMUJVTGA.nGvMhU1AdUAjLlVWrV4hz1qiI5vizpS	teacher	2025-11-05 12:59:28.40274	\N	\N	14	95	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
304	Маркіян Ваврух	vavrukh.markiian@lnu.edu.ua	$2a$06$rGUQEuHJkgzjmnZTTwwIM.zWqKxxJjljr4xfzR46XJfdQk509/TUK	teacher	2025-11-05 12:59:28.40274	\N	\N	15	96	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
305	Ігор Кошмак	koshma.ihor@lnu.edu.ua	$2a$06$paBuTDkMhjMO.ANQDjLZfe83idQGZJQ1fTM0rz/DZ8XG1zJC1abMG	teacher	2025-11-05 12:59:28.40274	\N	\N	15	96	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
306	Святослав Смєречинський	smerechynskyi.sviatoslav@lnu.edu.ua	$2a$06$MfVcHN889Cr3RZojSztwneOkS.CXF8w6pVLdeBnkX5DiZyZbLN/06	teacher	2025-11-05 12:59:28.40274	\N	\N	15	96	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
307	Руслан Брезвін	brezvin.ruslan@lnu.edu.ua	$2a$06$ky6PP/2BJzwr7muawAjTUeyuV35XaqlqHXSQOm.rKACwcA4HKgRym	teacher	2025-11-05 12:59:28.40274	\N	\N	15	97	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
308	Олег Антоняк	antoniak.oleh@lnu.edu.ua	$2a$06$x/lLVAyUmHiKkgvCnwjZAu.bkbYBnBuJmhUCLANqLSMt9Qbizq./i	teacher	2025-11-05 12:59:28.40274	\N	\N	15	97	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
309	Василь Курляк	kurlak.vasyl@lnu.edu.ua	$2a$06$jiyVzZTnXq1leQhL0bXTy.xO7edImZqR/363rMc0VYdAo2fThtuza	teacher	2025-11-05 12:59:28.40274	\N	\N	15	97	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
310	Василь Стадник	stadnyk.vasyl@lnu.edu.ua	$2a$06$xRNmoZj.DdIBdiTVO.NAb.bXHTb0b7RVRCkl8u43Q7weNq5TIIxsi	teacher	2025-11-05 12:59:28.40274	\N	\N	15	98	\N	\N	f	\N	2025-11-05 12:59:28.40274	\N	\N	\N	\N
657	Степан Білостоцький	bilostotskyi.stepan@lnu.edu.ua	$2a$06$tk5G7vqjVMq17f.W8/HzBOtrXpMuMUFO2qBv6eHrWQao0pJOqjE4.	teacher	2025-11-05 13:13:21.680049	\N	\N	48	48	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
658	Олексій Вінниченко	vynnychenko.oleksii@lnu.edu.ua	$2a$06$zBfRtX/oWhKqgqisyxDequbRDJtq9qft6yyQGkQJ.F5b3WrkekRBG	teacher	2025-11-05 13:13:21.680049	\N	\N	48	48	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
659	Олег Дудяк	dudiak.oleh@lnu.edu.ua	$2a$06$fBwc2ntvv.TRadXDTlSmneAp9YWvz49gx.3HIZuHbkxqfyKRcR4vO	teacher	2025-11-05 13:13:21.680049	\N	\N	48	48	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
660	Віктор Голубко	holubko.viktor@lnu.edu.ua	$2a$06$XBrGVakLMfjMf7SNBQys.OxCeqSHIWwR23y1jV.BYpMQZdqZVVcaq	teacher	2025-11-05 13:13:21.680049	\N	\N	53	53	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
661	Василь Чура	chura.vasyl@lnu.edu.ua	$2a$06$n44Jccm3QxmmnofHwIe4reJmBqd3ZkxB.MF5IcGokwucQ4d7q.TyW	teacher	2025-11-05 13:13:21.680049	\N	\N	53	53	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
662	Лев Калиняк	kalyniak.lev@lnu.edu.ua	$2a$06$TH9xXudte5DqxQYoxT9snuBvzah7ldYF1Jyjz4o9Wh9RjRHLQd8Mi	teacher	2025-11-05 13:13:21.680049	\N	\N	53	53	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
663	Роман Масик	masyk.roman@lnu.edu.ua	$2a$06$Q.jKVMljXWlwYRzbDaVfnOkWG4AjdePW.SQrtsWJ.6ljORL7bEqMK	teacher	2025-11-05 13:13:21.680049	\N	\N	53	53	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
664	Андрій Ковбасюк	kovbasiuk.andrii@lnu.edu.ua	$2a$06$yno/iYuYthUybYp9T52dwOazxIJlxtBBRupoCKsx.0SO1jig4B952	teacher	2025-11-05 13:13:21.680049	\N	\N	56	56	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
665	Оксана Король	korol.oksana@lnu.edu.ua	$2a$06$tUS./UGwRG2xyt519EHr5eAb1A6dG1CuWCNXzsZLZmdBUJBjlAVBe	teacher	2025-11-05 13:13:21.680049	\N	\N	56	56	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
320	Оксана Конопельник	konopelnyk.oksana@lnu.edu.ua	$2a$06$.CrHHWaauKA2iQ.2ZIgK8ePjqeaAzna83/EoMXnzNf05FutGkjS8m	teacher	2025-11-05 13:04:31.858096	\N	\N	15	98	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
321	Павло Щепанський	shchepanskyi.pavlo@lnu.edu.ua	$2a$06$zU1esMkIe78fV2O3V5oMHOl9InrPmokc2YWeG.pAmaIZNIpLoHHgu	teacher	2025-11-05 13:04:31.858096	\N	\N	15	98	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
322	Степан Мудрий	mudryi.stepan@lnu.edu.ua	$2a$06$a59u4PM64LA3QeEDotKF5eWUJezxtUAb2RrTgirsu2uMLdsf7W0oa	teacher	2025-11-05 13:04:31.858096	\N	\N	15	99	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
323	Ігор Штаблавий	shtablavyi.ihor@lnu.edu.ua	$2a$06$ECCo7.EQx64sVOFyjHgEceCNn/5bGWU7NEf4NT.MN/aKhPFk81LQ6	teacher	2025-11-05 13:04:31.858096	\N	\N	15	99	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
324	Флорій Бацевич	batsevych.florii@lnu.edu.ua	$2a$06$cQ1r9.1QaE6/w91YFipTxOJskXsVuEudVgQLjKcaE5kmv.1T0pEvq	teacher	2025-11-05 13:04:31.858096	\N	\N	16	100	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
325	Тетяна Єщенко	eshchenko.tetiana@lnu.edu.ua	$2a$06$nsXTlEkQQKPd6aQVaTjh3utdMunpEbABBxiD5.n2LmKAJXrN9PHOq	teacher	2025-11-05 13:04:31.858096	\N	\N	16	100	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
326	Світлана Григорук	hryhoruk.svitlana@lnu.edu.ua	$2a$06$az88tSrMbkEHlPnJ6HPL7ut54bKXaQklPoQclzVxMUTfeQsdkpHxW	teacher	2025-11-05 13:04:31.858096	\N	\N	16	100	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
327	Ірина Бундза	bundza.iryna@lnu.edu.ua	$2a$06$vKpR/1Cgepqmlny4mS4Hj.vXCAKLD4IARpCmnSmSU9w2Ofsui97s.	teacher	2025-11-05 13:04:31.858096	\N	\N	16	101	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
328	Христина Стельмах	stelmakh.khrystyna@lnu.edu.ua	$2a$06$gLCEgv8E6UNc/ZN0Qki.OOYXoAtF1ZB2kFS9ZpvKS5uF/yRBUHBXe	teacher	2025-11-05 13:04:31.858096	\N	\N	16	101	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
329	Ольга Сорока	soroka.olha@lnu.edu.ua	$2a$06$LMXF5ffooLotNphNCrrGtuFYQ6nsV6LIZTNwkKmMiNsrH0iNaUuFW	teacher	2025-11-05 13:04:31.858096	\N	\N	16	102	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
666	Федір Стригун	stryhun.fedir@lnu.edu.ua	$2a$06$MIiP.EtPUK9mgXZjbh71NumIJ2fq8YNt9.7yDet1FCMDH9/SkraBO	teacher	2025-11-05 13:13:21.680049	\N	\N	57	57	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
330	Ольга Албул	albul.olha@lnu.edu.ua	$2a$06$jErZLH2F5pPG7bPA/OBxfe66DnkJyVYTAE2TkPIDugAZvYGh0snh6	teacher	2025-11-05 13:04:31.858096	\N	\N	16	102	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
331	Зоряна Гілецька	hiletska.zoriana@lnu.edu.ua	$2a$06$wjbfAwUSAXLS2gE1v0vJluBI6i3v0IUVKZk3YsS2OEO0ITPaZ1fgW	teacher	2025-11-05 13:04:31.858096	\N	\N	16	102	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
332	Олександр Моторний	motornyi.oleksandr@lnu.edu.ua	$2a$06$kPu1Y29nykDolyuxkLmFiet6BVkrcCrebhJZngvQWVLSKJkrbBj/O	teacher	2025-11-05 13:04:31.858096	\N	\N	16	102	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
333	Ореста Забурянна	zaburianna.oresta@lnu.edu.ua	$2a$06$29RqQF/MAqA/LarROZjejOYDrjq/mFI3WJ.p..acKzxjIJocgInwS	teacher	2025-11-05 13:04:31.858096	\N	\N	16	103	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
334	Андрій Мацкевич	matskevych.andrii@lnu.edu.ua	$2a$06$BHSlx0YI5Z4FLFdLfC9o4esutp.t0fPHVi88wlnm5sq9Rn4CL2tXK	teacher	2025-11-05 13:04:31.858096	\N	\N	16	103	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
335	Валерій Корнійчук	korniichuk.valerii@lnu.edu.ua	$2a$06$AT1YF0Ft4ujf28eUiuI9V.UqlmSJ/imq0RtJIkcEOIBuO/ry/m5oS	teacher	2025-11-05 13:04:31.858096	\N	\N	16	104	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
336	Тарас Пастух	pastukh.taras@lnu.edu.ua	$2a$06$vIWQbaMV.GTJexMUjHW80OUtDdcYUQylWnu9r1I288UoZaHU58q.6	teacher	2025-11-05 13:04:31.858096	\N	\N	16	104	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
337	Роман Крохмальний	krokhmalnyi.roman@lnu.edu.ua	$2a$06$y5SkWvy8EDgHRuxg2KKmu.wgr1rWL1Xi/iLZymahFml5wVc4acQnu	teacher	2025-11-05 13:04:31.858096	\N	\N	16	104	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
338	Галина Крук	kruk.halyna@lnu.edu.ua	$2a$06$m7a6kFfMYhjiWrE5LmdLX.iq4EHaJK1ARmV6QWzFIbEa36w6K1BUe	teacher	2025-11-05 13:04:31.858096	\N	\N	16	104	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
339	Ореста Баса	basa.oresta@lnu.edu.ua	$2a$06$1KJ9pvg7inulYsqFjHgyiuMdq.8GX6jfI2/YeXIM0b.nXlm0Dy5N6	teacher	2025-11-05 13:04:31.858096	\N	\N	16	104	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
340	Уляна Хамар	khamar.uliana@lnu.edu.ua	$2a$06$EUdr9mt/TMGHgx9vw0NcO.j3m4pcWDkEZ.v3cGh9bcrqgUrbnE3vK	teacher	2025-11-05 13:04:31.858096	\N	\N	17	105	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
341	Віталій Литвин	lytvyn.vitalii@lnu.edu.ua	$2a$06$01L26SxK61aic9xhiuxw6uudisVf8rKcv.3rvEiN2wcftI7be1db.	teacher	2025-11-05 13:04:31.858096	\N	\N	17	106	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
342	Ігор Осадчук	osadchuk.ihor@lnu.edu.ua	$2a$06$KC3ljP0f6Teh3Xf8rMBSjuHxev3/gmGf36gt.N4uqn5zkt4Qe5bWW	teacher	2025-11-05 13:04:31.858096	\N	\N	17	106	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
343	Юлія Сліпецька	slipetska.yuliia@lnu.edu.ua	$2a$06$cRwTqqHClWWyx0jWGfX7yOenAUvGCVnYTc9hLTwlS1tEZdT0mYKle	teacher	2025-11-05 13:04:31.858096	\N	\N	17	106	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
344	Софія Грабовська	hrabovska.sofiia@lnu.edu.ua	$2a$06$UEKDNe8167b.WCnrgSIVgubuMUwLgnZ..QvY2cNue0C85Oel026Ue	teacher	2025-11-05 13:04:31.858096	\N	\N	17	107	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
345	Надія Гапон	hapon.nadiia@lnu.edu.ua	$2a$06$VDxk9Y8qAUY4Y8n0g9vOd.YVRUsjw5G5SjVZ0.Yx35sEv9W8q5sO2	teacher	2025-11-05 13:04:31.858096	\N	\N	17	107	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
346	Інга Петровська	petrovska.inha@lnu.edu.ua	$2a$06$WFa9FiHfcMdKMGWSpqM7nOH6MMlAolrjU5ofiz120a1.Ulu/aU7FC	teacher	2025-11-05 13:04:31.858096	\N	\N	17	107	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
347	Анна Вовк	vovk.anna@lnu.edu.ua	$2a$06$QzAnoqmXHkYO.BpObwC2MeJEu0MjeVyNOurPYyzg/1TH5KTM7QRNe	teacher	2025-11-05 13:04:31.858096	\N	\N	17	107	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
348	Вікторія Гупаловська	hupalovska.viktoriia@lnu.edu.ua	$2a$06$Xp9tDiIMg.hCr9Wy7IsxC.dZoMLTeFhy9qwwjO/rXRivdx5.IMV2m	teacher	2025-11-05 13:04:31.858096	\N	\N	17	107	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
349	Марина Кліманська	klimanska.maryna@lnu.edu.ua	$2a$06$rvEjac4cufhsvyGj5xCcmuDoNEc1C0ZV3f7MDEWqLWWcl2QmQUQ4W	teacher	2025-11-05 13:04:31.858096	\N	\N	17	107	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
350	Надія Левус	levus.nadiia@lnu.edu.ua	$2a$06$vLIQyuLQ00XyX.HJ3yk7Pu.qrSXgkZfklpMVUJ352npD/OrwxiF9a	teacher	2025-11-05 13:04:31.858096	\N	\N	17	107	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
351	Андрій Васьків	vaskiv.andrii@lnu.edu.ua	$2a$06$nZjYgNrOS3MHE.yLSxkGM.fjebPdoZHd1ptZXiCHNNrOmEXJ5RV7G	teacher	2025-11-05 13:04:31.858096	\N	\N	17	108	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
352	Роман Галуйко	haluiko.roman@lnu.edu.ua	$2a$06$Qw88OjfSx5PcT02ltqWFMOmQWMiwOi.xFVcfOhe/LXgPm4F33FQBK	teacher	2025-11-05 13:04:31.858096	\N	\N	17	108	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
353	Ігор Колесник	kolesnyk.ihor@lnu.edu.ua	$2a$06$hJH87FYZj4TS1bFIs//xS.gfjHeDNiJe/1JCcVPrrv6XN4/6nNGrK	teacher	2025-11-05 13:04:31.858096	\N	\N	17	108	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
354	Надія Лазарович	lazarovych.nadiia@lnu.edu.ua	$2a$06$4cGBSi.NqvwNodeRM506M.gZZZkr5adpW7cgNO.rXgAng2lq28Rt.	teacher	2025-11-05 13:04:31.858096	\N	\N	17	108	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
355	Анатолій Карась	karas.anatolii@lnu.edu.ua	$2a$06$vSV6u1JqtZiJcTM0fs4opOpXNx3gM.QHGD2EgpVLqOFKIhs0AxxFy	teacher	2025-11-05 13:04:31.858096	\N	\N	17	110	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
356	Марія Братасюк	bratasiuk.mariia@lnu.edu.ua	$2a$06$w/A/g47LnBLzoNWuKnGml.HySNLqYsGjdMSEj9YAhsLuVRO5YEtzC	teacher	2025-11-05 13:04:31.858096	\N	\N	17	110	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
357	Зоя Скринник	skrynnyk.zoia@lnu.edu.ua	$2a$06$gsxl34zxU.1n4jfIDSZEUO1JnJJb5AcmEGTuDhgo54BqCCdWMaJe2	teacher	2025-11-05 13:04:31.858096	\N	\N	17	110	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
358	Златислав Дубняк	dubniak.zlatyslav@lnu.edu.ua	$2a$06$73Qgyzplp6e9ggKk1FbKZ.gmDTUJ3UIk8vurYTsVqSdjSJ4l18fta	teacher	2025-11-05 13:04:31.858096	\N	\N	17	110	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
359	Ореста Лосик	losyk.oresta@lnu.edu.ua	$2a$06$ni5zI67G.et7Dqt6Al/1eehq1S6Grt.tsARMgusKLxLBVsiVCe6qm	teacher	2025-11-05 13:04:31.858096	\N	\N	17	110	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
360	Катерина Откович	otkovych.kateryna@lnu.edu.ua	$2a$06$IPQYqJUYTDmyIdKbbkhIiuLoBHcp8asK6llY/97vtCvTZ/0KR4X1K	teacher	2025-11-05 13:04:31.858096	\N	\N	17	110	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
361	Ярослав Каличак	kalychak.yaroslav@lnu.edu.ua	$2a$06$CWvjL0H2bhj6zBWIs9SaquoH2BWHpy5xFHuvGm6mMoMac46BAwLrG	teacher	2025-11-05 13:04:31.858096	\N	\N	18	111	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
362	Ольга Коркуна	korkuna.olha@lnu.edu.ua	$2a$06$JZrKAUwCs/1S6XOu9XTjfeMGTeO5INMLEIddrkeiRFz.GO6bvnHia	teacher	2025-11-05 13:04:31.858096	\N	\N	18	111	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
363	Петро Ридчук	rydchuk.petro@lnu.edu.ua	$2a$06$nBm5c3cfEmmX0Ny..Smt6.d76T9ktfKoFHDlqHCZlDYvn./F/jkoq	teacher	2025-11-05 13:04:31.858096	\N	\N	18	111	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
364	Олександр Тимошук	tymoschuk.oleksandr@lnu.edu.ua	$2a$06$wJVWW23r63wQAmqmP23lw.FJmqy.05xtL5b/5GEO7Py1jgNbxNyYe	teacher	2025-11-05 13:04:31.858096	\N	\N	18	111	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
365	Василь Матійчук	matiichuk.vasyl@lnu.edu.ua	$2a$06$j24NREyntgr3F6kuy2Sof.N6LMYg6Ps57ZOJDN6LQWQHv0Buc8eAS	teacher	2025-11-05 13:04:31.858096	\N	\N	18	112	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
366	Роман Мартяк	martiak.roman@lnu.edu.ua	$2a$06$fgRk6SRlH12NtY8E.LdzSOokh.gwZ3ePdDBOkYU9Fp0Zg1TArgGh.	teacher	2025-11-05 13:04:31.858096	\N	\N	18	112	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
367	Микола Тупичак	tupychak.mycola@lnu.edu.ua	$2a$06$V6txVoJDykvR9pmHPdQSsuHJ2FPIq7CyfsFenXf.D26QnZyLCBZhC	teacher	2025-11-05 13:04:31.858096	\N	\N	18	112	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
368	Григорій Дмитрів	dmytriv.hryhorii@lnu.edu.ua	$2a$06$/ATyJ8oWOrvBUXHzNmDU3.Uoq.yX/W27Arr6J4gJCPG02dI6e1IHG	teacher	2025-11-05 13:04:31.858096	\N	\N	18	113	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
369	Юрій Сливка	slyvka.yurii@lnu.edu.ua	$2a$06$BSQb/s5qUJUvRKkR57c/R.pGr8U.UTD.1zsK8xOEy45zfGPV7IbxW	teacher	2025-11-05 13:04:31.858096	\N	\N	18	113	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
370	Оксана Заремба	zaremba.oksana@lnu.edu.ua	$2a$06$8tOYVhJ3m91WNXGjqiPyY..iUQfc7PCVpcVSQBI33bLpf7nt7tAwW	teacher	2025-11-05 13:04:31.858096	\N	\N	18	113	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
371	Марія Конік	konyk.mariia@lnu.edu.ua	$2a$06$pH4VbZbAgs5wmEPc16b8duxVEOBEP4exXJuNlR/7K7Ta2HTJBwa56	teacher	2025-11-05 13:04:31.858096	\N	\N	18	113	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
372	Світлана Пукас	pukas.svitlana@lnu.edu.ua	$2a$06$H4HV2zsFq1vGZ6p.wrfUyO5vCp13dLkZHCwUesNhXhWsMfacEo9gm	teacher	2025-11-05 13:04:31.858096	\N	\N	18	113	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
373	Микола Кобилецький	kobyletskyi.mycola@lnu.edu.ua	$2a$06$iEFHqEjSoqOKrdOONoNYM.4gLbujVRERpJA575BypjoThmnJZC9kW	teacher	2025-11-05 13:04:31.858096	\N	\N	19	114	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
374	Андрій Школик	shkolik.andrii@lnu.edu.ua	$2a$06$PzWXZI/JU03NspeWABaJ9u94swCm2u1lJngpLzb3.ofnPD7XUaFzK	teacher	2025-11-05 13:04:31.858096	\N	\N	19	114	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
375	Володимир Кахнич	kakhnych.volodymyr@lnu.edu.ua	$2a$06$8XEsorlDqbetemjjN2NMCOEDCO6R0V8Bz7hcHXl1N.fPBV/BK8GE.	teacher	2025-11-05 13:04:31.858096	\N	\N	19	114	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
376	Марта Труш	trush.marta@lnu.edu.ua	$2a$06$QIrelS60uNlqLGSc34VVP.036jk/m3Zryhv75y.V4CYZMYSqTgFY2	teacher	2025-11-05 13:04:31.858096	\N	\N	19	114	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
377	Роман Шандра	shandra.roman@lnu.edu.ua	$2a$06$LF09j.ZnCyl1Gt2Z/I.iCeU9LD7/IrDELDMrD21bevjoYLRE3Vn3a	teacher	2025-11-05 13:04:31.858096	\N	\N	19	114	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
378	Сергій Рабінович	rabinovych.serhii@lnu.edu.ua	$2a$06$ckWZGdBEWkFa.ymtkX11I.9Y85R3sCZoq0OwoFDDxir3HItreCNh.	teacher	2025-11-05 13:04:31.858096	\N	\N	19	115	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
379	Любомир Бориславський	boryslavskyi.liubomyr@lnu.edu.ua	$2a$06$N8taclCKeKcoZZxOoe6xouQGBaMH1QaAiud4tlPgUTS7sCHmth31.	teacher	2025-11-05 13:04:31.858096	\N	\N	19	115	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
380	Ігор Заєць	zaits.ihor@lnu.edu.ua	$2a$06$/9yAlKAbfNxutzl7mE0OS.y64.Y/xSCkagk05uYrjNk8ys1DORi8K	teacher	2025-11-05 13:04:31.858096	\N	\N	19	115	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
381	Петро Манюк	maniuk.petro@lnu.edu.ua	$2a$06$KJu2e46JMuO.ONTEV6DY6e6K/vOEe8V53d1W7T0/9lIzSEhh6mA2i	teacher	2025-11-05 13:04:31.858096	\N	\N	19	115	\N	\N	f	\N	2025-11-05 13:04:31.858096	\N	\N	\N	\N
382	Назар Бобечко	bobechko.nazar@lnu.edu.ua	$2a$06$Sxdyrqizgdq96JrWHqlMletv1ZLqCmj5Gx5x1bxY635xpb5COvFpq	teacher	2025-11-05 13:04:58.905026	\N	\N	19	116	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
383	Микола Багрій	bahrii.mycola@lnu.edu.ua	$2a$06$nO9zbb6iRAhNIkkam./GTu5dOkfb36PczN8NHM5yYMzpA1/YGEvJO	teacher	2025-11-05 13:04:58.905026	\N	\N	19	116	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
384	Володимир Бойко	boiko.volodymyr@lnu.edu.ua	$2a$06$HXX.e4LC/FVdZzXNTfwn6uKUrjEY5mb7.gpCjm1mWo8FCX9Ad98PS	teacher	2025-11-05 13:04:58.905026	\N	\N	19	116	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
385	Оксана Калужна	kaluzhna.oksana@lnu.edu.ua	$2a$06$cGafHWTVytbegR2N9TWEjOMvnFbV3EkOBTiTgzmc3kDF7u9oekOn6	teacher	2025-11-05 13:04:58.905026	\N	\N	19	116	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
386	Наталія Максимишин	maksymyshyn.nataliia@lnu.edu.ua	$2a$06$bFNWQtWlwiUnl4wq0XMT5ucZDcYf9D1KcWyoc3MChwv1cfYNczdxS	teacher	2025-11-05 13:04:58.905026	\N	\N	19	116	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
387	Анатолій Найда	naida.anatolii@lnu.edu.ua	$2a$06$dp.g77EhYjzdFbvM1WgUEeKRKfVxIjfT5f/c7AtAHZcV3hPRqisge	teacher	2025-11-05 13:04:58.905026	\N	\N	19	116	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
388	Володимир Бурак	burak.volodymyr@lnu.edu.ua	$2a$06$cvw9T1Ei6XclNgPpbKrQGeeU0jz6L8H6.xNlWv/UK0hztYn6p.9nK	teacher	2025-11-05 13:04:58.905026	\N	\N	19	117	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
389	Олена Рим	rym.olena@lnu.edu.ua	$2a$06$jTKDuUu.aE.xtqxEzGxS8uV.X3r5K3U3LzkWBqJpwLAdLkf.K5NIS	teacher	2025-11-05 13:04:58.905026	\N	\N	19	117	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
390	Наталія Барабаш	barabash.nataliia@lnu.edu.ua	$2a$06$CDTEdm9K3CClOtH0e.Baf.Qd1wrW7K8tkD1L2w/jBgyM5YJG5Lasq	teacher	2025-11-05 13:04:58.905026	\N	\N	19	117	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
391	Ірина Ласько	lasko.iryna@lnu.edu.ua	$2a$06$KUWxKISjo.lBxz5ZpoqUuO01jLepq2Gp2NGmu/wjvCuEAsvzntpMS	teacher	2025-11-05 13:04:58.905026	\N	\N	19	117	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
392	Данило Лещух	leshchuk.danylo@lnu.edu.ua	$2a$06$0FynexdwMnxyELbXQxGbWe0KoOMqu5J6.zqtFlLN0uiXw/qS0kqca	teacher	2025-11-05 13:04:58.905026	\N	\N	19	117	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
393	Орест Раневич	ranevych.orest@lnu.edu.ua	$2a$06$EFr63GRJ0Do/ulhU7wPUfeZD0rc/aOVic2wS5JSJJyy0tjW0ECxN2	teacher	2025-11-05 13:04:58.905026	\N	\N	19	117	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
394	Володимир Стрепко	strepko.volodymyr@lnu.edu.ua	$2a$06$qYwKi3.XK4ToVy/I8wZafu83/NPLDEJ/mI5XtmNcfnrPqw.Ck3nLC	teacher	2025-11-05 13:04:58.905026	\N	\N	19	117	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
395	Ігор Фурик	furyk.ihor@lnu.edu.ua	$2a$06$W4eTC5BoU5jCw07fZFzcdOJ7RAcRFxuIJMlo8./gW8jsyrmS9RgwK	teacher	2025-11-05 13:04:58.905026	\N	\N	19	117	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
396	Алла Герц	herts.alla@lnu.edu.ua	$2a$06$C4hmUpuj4yJzE9HNhjE..OFU8mTvCyzWrVepl7uvWB.e7KigY7yrK	teacher	2025-11-05 13:04:58.905026	\N	\N	19	118	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
397	Наталія Квіт	kvit.nataliia@lnu.edu.ua	$2a$06$Jf8207omJwUotcgpo2A9IuWbw6n3WOYCjgQ5mjb7AbItN55Dk1A2K	teacher	2025-11-05 13:04:58.905026	\N	\N	19	118	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
398	Зорислава Ромовська	romovska.zoryslava@lnu.edu.ua	$2a$06$gnQmUIgTZssepSVzWaWbUuso0Yqvn.RMrnLKj4KnoCm52rUSNngey	teacher	2025-11-05 13:04:58.905026	\N	\N	19	118	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
399	Юрій Юркевич	yurkevych.yurii@lnu.edu.ua	$2a$06$FnhqiCH9KGLhSQ6V5DT2P.SIO0to4pzyGIfbdFQI1AiKW3Ve9mFM.	teacher	2025-11-05 13:04:58.905026	\N	\N	19	118	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
400	Уляна Андрусів	andrusiv.uliana@lnu.edu.ua	$2a$06$dj8vJ4l9nWXMS7HW9FQEROrhmaEm4qlPZqTZ6FlKDlffZixte16Vu	teacher	2025-11-05 13:04:58.905026	\N	\N	19	118	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
401	Йосип Богдан	bohdan.yosyp@lnu.edu.ua	$2a$06$k3/J7RLPKRpGb3OPcPkovu7wtiGGq/3W/Ddcn/S0xFtZUmm1Xo4LC	teacher	2025-11-05 13:04:58.905026	\N	\N	19	118	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
402	Богданна Косович	kosovych.bohdanna@lnu.edu.ua	$2a$06$XDFPSb2h6pj8Bf5QQHvqSeLHRcRsewaaeB4/HxyeOOxb.OYHOaLgu	teacher	2025-11-05 13:04:58.905026	\N	\N	4	25	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
403	Андрій Бабський	babskyi.andrii@lnu.edu.ua	$2a$06$syjdckEKqGvzE4xHdHqbH.mxHD5pj5A0kSW0OQiPznU.3sG5tlgRi	teacher	2025-11-05 13:04:58.905026	\N	\N	1	1	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
404	Марта Бура	bura.marta@lnu.edu.ua	$2a$06$vtP29FB7AxTl8N0DyntZI.GXuwDAXVedAnLQl4l6AlTztmkcLuEEC	teacher	2025-11-05 13:04:58.905026	\N	\N	1	1	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
405	Анастасія Генега	heneha.anastasiia@lnu.edu.ua	$2a$06$z5IEVg5yQCDq9oW0C2WU7uthNvbeqNlYrVJvSYfnc/55rc496B8Ey	teacher	2025-11-05 13:04:58.905026	\N	\N	1	1	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
406	Антоніна Тарновська	tarnovska.antonina@lnu.edu.ua	$2a$06$X.ral.OS0R0MQHFn6lVXKuuIV3K7ojlzOZ3F3fYh2Bnd1us9ni9oS	teacher	2025-11-05 13:04:58.905026	\N	\N	1	1	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
407	Ярина Шалай	shalai.yaryna@lnu.edu.ua	$2a$06$XyKaz0gK7VVEo7f7BRMACuSeTWIOJ4NeTfvtGF12DNa8qihLmZQMq	teacher	2025-11-05 13:04:58.905026	\N	\N	1	1	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
408	Ірина Бродяк	brodziak.iryna@lnu.edu.ua	$2a$06$ctMo/J1.mLRHhppjZBfrVOFQGVnnYYm7a/s0Ct/xDYMgRsgPYrbuu	teacher	2025-11-05 13:04:58.905026	\N	\N	1	2	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
409	Мар'яна Люта	liuta.mariana@lnu.edu.ua	$2a$06$QNK6f2O/B7yirix114wesOKT5x19Y4Ksv7jfQ9Aew0bTXbVNjsr3a	teacher	2025-11-05 13:04:58.905026	\N	\N	1	2	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
410	Марія Сабадашка	sabadashka.mariia@lnu.edu.ua	$2a$06$lzcecCUhGR3aAe/.OzmEwOuS97f1jkJE/H99midbNPHqN0/aYq5sW	teacher	2025-11-05 13:04:58.905026	\N	\N	1	2	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
411	Олена Стасик	stasyk.olena@lnu.edu.ua	$2a$06$Bgz4TxbOvvVK4RvaZz4RoesLM4l3bdmSHuhVZAyClyureEnnyBaVS	teacher	2025-11-05 13:04:58.905026	\N	\N	1	2	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
412	Лідія Тасєнкевич	tasienkevych.lidiia@lnu.edu.ua	$2a$06$9Gmrbw5WYlyvGWEdpGIc9.URLR0Cfh//O1yfziGymU5j6tzvUj8pe	teacher	2025-11-05 13:04:58.905026	\N	\N	1	3	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
413	Анастасія Одіцова	oditsova.anastasiia@lnu.edu.ua	$2a$06$yMHGyJnkINRpPcnf5mgTfuBAQpCHmDhiyoLqIkXNc93eB3r1hKuty	teacher	2025-11-05 13:04:58.905026	\N	\N	1	3	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
414	Віктор Федоренко	fedorenko.viktor@lnu.edu.ua	$2a$06$kx1B2iezSurKKgM4GPtb6uxOjrHEJkkyQPzN1nICw2f0QOo6uwVJG	teacher	2025-11-05 13:04:58.905026	\N	\N	1	4	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
415	Лідія Боднар	bodnar.lidiia@lnu.edu.ua	$2a$06$ELsXkmd0sbQrPBmA7L8JMOZIfZHzBF0YLbb34fTh3DpMLw4.cQ1mu	teacher	2025-11-05 13:04:58.905026	\N	\N	1	4	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
416	Наталія Матійців	matiitsiv.nataliia@lnu.edu.ua	$2a$06$J0toySfZghN7/BymnEc5iei3J9KBkrOMg39WfgyA1PHMBsULttUvq	teacher	2025-11-05 13:04:58.905026	\N	\N	1	4	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
417	Звенислава Мамчур	mamchur.zvenyslava@lnu.edu.ua	$2a$06$KTy4.rF74ERNM3rzdJpCku7joolga0OhT6MP97y1E9auQcT6ji5Bm	teacher	2025-11-05 13:04:58.905026	\N	\N	1	9	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
418	Галина Антоняк	antoniak.halyna@lnu.edu.ua	$2a$06$7Jm26vwWXqOOvD9e3DwFQuAm8T3WvSKpy0ZfTa9fY8xRfwZAkHh66	teacher	2025-11-05 13:04:58.905026	\N	\N	1	9	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
419	Марина Рагуліна	rahulina.maryna@lnu.edu.ua	$2a$06$eE5Xa3X7/nZhWYY7w/cLVOvvW07uI4b16wCuX1Ao3osXCucs/Z42u	teacher	2025-11-05 13:04:58.905026	\N	\N	1	9	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
420	Ольга Цвілінюк	tsviliiniuk.olha@lnu.edu.ua	$2a$06$mxkEuq3NY1/T9UCkYicLF.YE9FdMNcJdB5Jih/gJv/9k.Vre3WXWK	teacher	2025-11-05 13:04:58.905026	\N	\N	1	9	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
421	Оксана Гнатина	hnatyna.oksana@lnu.edu.ua	$2a$06$/Ut0jC/8elaArXXTue/nNe10MI6sAq8QV/NpnPJpSqKKhhyQlH/ry	teacher	2025-11-05 13:04:58.905026	\N	\N	1	5	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
422	Олег Іванець	ivanets.oleh@lnu.edu.ua	$2a$06$WTPDZPCwxV01B.NaLw3FtuSdC4a6ze5QwOcddykCTVb3EKXv.nYgm	teacher	2025-11-05 13:04:58.905026	\N	\N	1	5	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
423	Катерина Назарук	nazaruk.kateryna@lnu.edu.ua	$2a$06$VU//.3ipp8BTIrLbeQu2aOu52P3PCVQQfcgS8bEUXsa0.hAjCITNW	teacher	2025-11-05 13:04:58.905026	\N	\N	1	5	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
424	Оксана Гнатів	hnativ.oksana@lnu.edu.ua	$2a$06$Ud9DLcT3lmw/K5eUZvFxVeTFIfG9DXVF.3cuROVdw2BGr8RtvR2Fa	teacher	2025-11-05 13:04:58.905026	\N	\N	19	118	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
425	Степан Коссак	kossak.stepan@lnu.edu.ua	$2a$06$LUChXtB/hRG3OYzJ6Te4OOEY5iuFtBbFxtY2B18PAvnNo6S.UBJki	teacher	2025-11-05 13:04:58.905026	\N	\N	19	118	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
426	Світлана Гнатуш	hnatush.svitlana@lnu.edu.ua	$2a$06$we5vqksz./BcpKAHfqN0JO/UPenbyNuacK9/du/ea9YHNXPOnKaUC	teacher	2025-11-05 13:04:58.905026	\N	\N	1	6	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
427	Галина Звір	zvir.halyna@lnu.edu.ua	$2a$06$DN5tNpIzfWqGWIIFF9J42u/68o9i58fqM4xP9P9Z9toKQmo4jfn0y	teacher	2025-11-05 13:04:58.905026	\N	\N	1	6	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
428	Ольга Масловська	maslovska.olha@lnu.edu.ua	$2a$06$qM6dlwrk62vG6aB4IGjglO0QaQctkcAC5mvoRrzwUu5iPrCgP8VBa	teacher	2025-11-05 13:04:58.905026	\N	\N	1	6	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
429	Галина Яворська	yavorska.halyna@lnu.edu.ua	$2a$06$qEK6YnfDEXe/9L5gRLINV..pr/F8IumGDizqn5BcYWJaBZSuKMUEy	teacher	2025-11-05 13:04:58.905026	\N	\N	1	6	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
430	Роман Лозинський	lozynskyi.roman@lnu.edu.ua	$2a$06$zZPUCWdWvJwcymU9Q3ku2urb4G3iPW1pe2MxaRUmPZHxX.UJU73Cy	teacher	2025-11-05 13:04:58.905026	\N	\N	2	10	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
431	Андрій Байцар	baitsar.andrii@lnu.edu.ua	$2a$06$pYiGCtQMXXBqGi7LVCEg7OTHygfvx76tJx.gDg0jl2q6ZH5TUtKzy	teacher	2025-11-05 13:04:58.905026	\N	\N	2	10	\N	\N	f	\N	2025-11-05 13:04:58.905026	\N	\N	\N	\N
432	Галина Лабінська	labinska.halyna@lnu.edu.ua	$2a$06$AtCkqwiL.a/n8ULM4IsnGudL5VCGjL7t/J9UfRMzwJZ3vTHXuC9J.	teacher	2025-11-05 13:07:29.012878	\N	\N	2	10	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
433	Марія Лаврук	lavruk.mariia@lnu.edu.ua	$2a$06$.p0L4/OT5I4MsBvHyutqm.RMiE0yoLa27miL.b5fCDfIuSZ46UsMi	teacher	2025-11-05 13:07:29.012878	\N	\N	2	10	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
434	Іван Круглов	kruhlov.ivan@lnu.edu.ua	$2a$06$s7etHi8QxYWT9lrepxTkDutt2/a/ZC1aefRpG1fkBkVxQlw3N/3NS	teacher	2025-11-05 13:07:29.012878	\N	\N	2	17	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
435	Олеся Буряник	burianyk.olesia@lnu.edu.ua	$2a$06$/D4LAe/C1Me89gDxKleLRuMpQ6X.ZDoOu.MLnORDxat/MmyDSTLL.	teacher	2025-11-05 13:07:29.012878	\N	\N	2	17	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
436	Людмила Костів	kostiv.lyudmyla@lnu.edu.ua	$2a$06$FfSB8Xiu7msAPufr9P8BHeWjdjMjB8/Gj/F0rqXHskHSNCu1QxEZu	teacher	2025-11-05 13:07:29.012878	\N	\N	2	17	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
437	Володимир Матвіїв	matviiv.volodymyr@lnu.edu.ua	$2a$06$R6tHiS/lVudiA/8f/HazGO1zkCiJSWz7fDUkyf8U6e27IWf3sZI4G	teacher	2025-11-05 13:07:29.012878	\N	\N	2	17	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
438	Лідія Дубіс	dubis.lidiia@lnu.edu.ua	$2a$06$iaW4pr/FGmWE8vSxgDD1i.zB89fpR.ikmO3bDd5EIlo79NFeeWUXK	teacher	2025-11-05 13:07:29.012878	\N	\N	2	11	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
439	Галина Байрак	bairak.halyna@lnu.edu.ua	$2a$06$3uyzGWt/sYG4sr0IdUwNLuQxyx6pf9mjWTLVSn4hArR2S8afcJ9Rq	teacher	2025-11-05 13:07:29.012878	\N	\N	2	11	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
440	Роман Гнатюк	hnatiuk.roman@lnu.edu.ua	$2a$06$H0rFnj6uhnjZmFHrmkptXOjfNP6ZdNa/zLeUrEtDGsjDbaJ9tVsyW	teacher	2025-11-05 13:07:29.012878	\N	\N	2	11	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
441	Павло Горішній	horishnii.pavlo@lnu.edu.ua	$2a$06$iWkqIok47rcRZ1W2pwKp.OL.gMs6hsKOy5S30EY3x8zK6No40Cj1W	teacher	2025-11-05 13:07:29.012878	\N	\N	2	11	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
442	Марта Мальська	malska.marta@lnu.edu.ua	$2a$06$vxk62gdm6mMAwIGrDG/tC.zl5KM9UDEV3TSaQFVUU3hcmJZAelrWy	teacher	2025-11-05 13:07:29.012878	\N	\N	2	16	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
443	Володимир Худо	khudo.volodymyr@lnu.edu.ua	$2a$06$Vu7tVnir3y31QJxso5N6NOgKOoWqWiVSOsVSSuxebErZbphYBWyZG	teacher	2025-11-05 13:07:29.012878	\N	\N	2	16	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
444	Любомир Безручко	bezruchko.liubomyr@lnu.edu.ua	$2a$06$rEbXVfr8qr1ySM1Us6ga.eBvsIm.8VKMAp4owoHhEr5zMEI/M/Ws.	teacher	2025-11-05 13:07:29.012878	\N	\N	2	16	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
445	Ореста Бордун	bordun.oresta@lnu.edu.ua	$2a$06$UQu7ejxMAVpQtrbRxgTx3Odipel/O0WzN/fnZlp.Zbjt2T46qhE6u	teacher	2025-11-05 13:07:29.012878	\N	\N	2	16	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
446	Роман Дмитрук	dmytruk.roman@lnu.edu.ua	$2a$06$6V1GzMmYrOvob7ceXof6XOrACS5T9Wi/kCFilIAMJJfnl.JS2As..	teacher	2025-11-05 13:07:29.012878	\N	\N	2	16	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
447	Юрій Жук	zhuk.yurii@lnu.edu.ua	$2a$06$YfQbcCCmWUwI8tkxzKL0iOMzXTnLsS15lXse2A6LoZPvZkTU6yRCO	teacher	2025-11-05 13:07:29.012878	\N	\N	2	16	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
448	Володимир Монастирський	monastyrskyi.volodymyr@lnu.edu.ua	$2a$06$NbGR9ESbgSztKwyS7fkDyupdw.veNlcefmVz1b7ePayvYcM.5BaIG	teacher	2025-11-05 13:07:29.012878	\N	\N	2	16	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
449	Василь Стецький	stetskyi.vasyl@lnu.edu.ua	$2a$06$eRpZudaYWaP8DQZ2U8sLDuFMCVSorgTTRsfCtd/5V7FGZEJBL0H82	teacher	2025-11-05 13:07:29.012878	\N	\N	2	16	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
450	Микола Павлунь	pavlun.mycola@lnu.edu.ua	$2a$06$LRxtmPlVTjPuM4/mLa3axuwBpm8I8QlcnPQ2iusg7dgqC3lbtsreK	teacher	2025-11-05 13:07:29.012878	\N	\N	3	18	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
451	Віталій Фурман	furman.vitalii@lnu.edu.ua	$2a$06$nasoyOifonSEVkyNTJcQceerCw1F8QRFJSvcwktVoht8qsRLdqOxC	teacher	2025-11-05 13:07:29.012878	\N	\N	3	18	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
452	Микола Хом'як	khomiak.mycola@lnu.edu.ua	$2a$06$rxXahSEfYnUGaONOzUJunu6Z94wHlpZksLE3IFXGartHXvbuNTYPm	teacher	2025-11-05 13:07:29.012878	\N	\N	3	18	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
453	Петро Волошин	voloshyn.petro@lnu.edu.ua	$2a$06$j7gCDlqxx3NeCPH9ePsV6utAC26j/RDI0Qt5Zgdn.C7LlEi/u9I4K	teacher	2025-11-05 13:07:29.012878	\N	\N	3	19	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
454	Юрій Крупський	krupskyi.yurii@lnu.edu.ua	$2a$06$zwVLCyuZZ7Pw/mZeTJ3CMe4ld4oo6jLUZiYAUCGFHbm8QkdAOB7eK	teacher	2025-11-05 13:07:29.012878	\N	\N	3	19	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
455	Василь Дяків	diakiv.vasyl@lnu.edu.ua	$2a$06$Nc4lZbW7NdL22abVmU25MuAs8EYX3lfzbaRcA9aoLidS86ESgmDIG	teacher	2025-11-05 13:07:29.012878	\N	\N	3	19	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
456	Євгенія Сливко	slyvko.yevheniia@lnu.edu.ua	$2a$06$PyX7Wi7Ts8do6rHlH20tAuwa3dGX97q8p/bxJ44X5Mf5mb61Cx6da	teacher	2025-11-05 13:07:29.012878	\N	\N	3	19	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
457	Наталія Радковець	radkovets.nataliia@lnu.edu.ua	$2a$06$Qwm2y5v9uTxfwpJD5U3Cke2oeMxRsv0jz4whZD5wvRlUuP3Zbj1xe	teacher	2025-11-05 13:07:29.012878	\N	\N	3	20	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
458	Галина Гоцанюк	hotsaniuk.halyna@lnu.edu.ua	$2a$06$3glTtYGCXvXZfzVG4D1IIe8xPANkDeyzAbnEmoMM6ZxZXzQmKnchy	teacher	2025-11-05 13:07:29.012878	\N	\N	3	20	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
459	Леонід Хом'як	khomiak.leonid@lnu.edu.ua	$2a$06$K/5InVajoV5zPJOFoO8Kj.lbmyaBs7SpsHlV7nYlCwoBgm8whTLw2	teacher	2025-11-05 13:07:29.012878	\N	\N	3	20	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
460	Ігор Шайного	shainoho.ihor@lnu.edu.ua	$2a$06$bdq4x9jXTyaRpyNSGFtOLOKcBf2l.httm8xohEFLCvXS89bQQuYF6	teacher	2025-11-05 13:07:29.012878	\N	\N	3	20	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
461	Уляна Борняк	borniak.uliana@lnu.edu.ua	$2a$06$QD/JLweGQEWDoI6EaHcF3e.iyHizgfZOa.uRysUHROX9dA7W2XmFy	teacher	2025-11-05 13:07:29.012878	\N	\N	3	21	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
462	Соломія Кріль	kril.solomiia@lnu.edu.ua	$2a$06$ma8Q/.mQdl5kQybGbbcyA.nhl5Jca4UDFjb9TeTYDVjD0ZugYsAce	teacher	2025-11-05 13:07:29.012878	\N	\N	3	21	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
463	Надія Словотенко	slovotenko.nadiia@lnu.edu.ua	$2a$06$DZ8PSWF2MGRbQ/jTV8Oh/.4zU/VZrAienY6hsKveCtonuJE2ziI96	teacher	2025-11-05 13:07:29.012878	\N	\N	3	21	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
464	Людмила Войтович	voitovych.lyudmyla@lnu.edu.ua	$2a$06$9joK5XMCTuahCADSTZv4bO/.WSzjrI6CQWs1B99VVzEHQsh44tqMW	teacher	2025-11-05 13:07:29.012878	\N	\N	4	22	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
465	Ірина Грабинська	hrabynska.iryna@lnu.edu.ua	$2a$06$dlq39CHHXY7WFU9KNAS/Re1t5PzuqOsSph5vWaX8zid2p0ChIb/3O	teacher	2025-11-05 13:07:29.012878	\N	\N	4	22	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
466	Ростислав Михайлишин	mykhailyvshyn.rostyslav@lnu.edu.ua	$2a$06$52MP1jsAYfmNENM7EBaAueZK05r5Zmn.gG6T3bGAX4AfffBu6ssMK	teacher	2025-11-05 13:07:29.012878	\N	\N	4	22	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
467	Оксана Клювак	kliuvak.oksana@lnu.edu.ua	$2a$06$3CaoKJzZDjAafP5Fm6Kl2u4KaqGzbi7uHjmgNUOq8OF9b6M6/sMNO	teacher	2025-11-05 13:07:29.012878	\N	\N	4	24	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
468	Тетяна Яворська	yavorska.tetiana@lnu.edu.ua	$2a$06$BtEkCf6sGKClsib2P6/bbuXKvPz3rMS0yqRzplsOrpYliIZnYwHr6	teacher	2025-11-05 13:07:29.012878	\N	\N	4	27	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
469	Надія Бортнік	bortnyk.nadiia@lnu.edu.ua	$2a$06$XNhyVclH2MSMV6WE0lw1Qe6WQfK2R8x9K/BZZcvegaLFhh7l1oBVe	teacher	2025-11-05 13:07:29.012878	\N	\N	4	27	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
470	Олена Врублевська	vrublevska.olena@lnu.edu.ua	$2a$06$p6VbHRmXkyPXpChTBCbLUeHjnLhfHGvqarkmz6f9d07f4h1iKHsXa	teacher	2025-11-05 13:07:29.012878	\N	\N	4	27	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
471	Ірина Городняк	horodniak.iryna@lnu.edu.ua	$2a$06$uOxP8HIaPHVd7D9X/AKgyew4ATgvcWiO3HVrEgb8PVVTtroTYxgB.	teacher	2025-11-05 13:07:29.012878	\N	\N	4	27	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
472	Юлія Зіньцо	zintso.yuliia@lnu.edu.ua	$2a$06$Sk6RExX2KtXGnT25J5MV/Obr/MwC9A1QXX0UdfJamzYWFmlHFqoXu	teacher	2025-11-05 13:07:29.012878	\N	\N	4	27	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
473	Оксана Сенишин	senyshyn.oksana@lnu.edu.ua	$2a$06$kNQ2IY0OSauSYVsGikBgTOZbR/jh0T6IDCTNdFN0AADKqaP3ZSpua	teacher	2025-11-05 13:07:29.012878	\N	\N	4	28	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
474	Мар'яна Виклюк	vykliuk.mariana@lnu.edu.ua	$2a$06$HgVr85PO4/LkrabAoNGUl.skzSvyGugYnrmGTIcyAFLHeQxYZ6t.O	teacher	2025-11-05 13:07:29.012878	\N	\N	4	28	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
475	Марта Горинь	horyn.marta@lnu.edu.ua	$2a$06$XYbqLpj6qTafrNd4xWju..lQPBgpduYK0zKBK3H9Ou775XvSPosdO	teacher	2025-11-05 13:07:29.012878	\N	\N	4	28	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
476	Наталія Данилевич	danylevych.nataliia@lnu.edu.ua	$2a$06$2kg4nhFUEjiAwQTSnEppjOHEAiwuXS3W8V22gqx95uxRhIsUXBy.G	teacher	2025-11-05 13:07:29.012878	\N	\N	4	28	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
477	Мар'яна Замроз	zamroz.mariana@lnu.edu.ua	$2a$06$YBTV7vjyeVk1DkUopBNQEeYqfKSsKq8jZlsVPkDnonUrEzXU0Nha6	teacher	2025-11-05 13:07:29.012878	\N	\N	4	28	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
478	Марія Хмелярук	khmeliaruk.mariia@lnu.edu.ua	$2a$06$I8i8HnBj2UG.OcdSYOFJw.1WWYnLikrRY1gm0XTbAKsguzYMizNVy	teacher	2025-11-05 13:07:29.012878	\N	\N	4	22	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
479	Маріанна Кохан	kokhan.marianna@lnu.edu.ua	$2a$06$Cg8YJ/WYmsW8Ra9CQurdFehGgWhEtzUTlpYvG0xd2TlJkVzbhD5xq	teacher	2025-11-05 13:07:29.012878	\N	\N	4	28	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
480	Ольга Кривешко	kryveshko.olha@lnu.edu.ua	$2a$06$Pn2KOAwoQTfW0ByUB55vFe9M7rTRTQh999MQdD5qYPdddhdkp0z/i	teacher	2025-11-05 13:07:29.012878	\N	\N	4	28	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
481	Михайло Оробчук	orobchuk.mykhailo@lnu.edu.ua	$2a$06$gBmRTk.qNDwRwQoeCNZ4Se1Eh6kUi9t48cMvJdJDrvGEW9aV4ahMC	teacher	2025-11-05 13:07:29.012878	\N	\N	4	28	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
482	Юрій Раделицький	radelytskyi.yurii@lnu.edu.ua	$2a$06$G54.U2D/IGkDCQ1JsTOw6eHJ7Twh5sJBnYO68NPJkSydEmrjROGiS	teacher	2025-11-05 13:07:29.012878	\N	\N	4	29	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
483	Максим Корягін	koriagin.maksym@lnu.edu.ua	$2a$06$GLH8QBGVlieBLX0NovNLcea4GT0b2CyRCqZxY1v30EcGBbHCCxrqq	teacher	2025-11-05 13:07:29.012878	\N	\N	4	29	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
484	Наталія Струк	struk.nataliia@lnu.edu.ua	$2a$06$LMPsK7JWBekOYabIXLzBTO1bEuZJYa7.FkAmGvUF.1DFWP8X7qXBK	teacher	2025-11-05 13:07:29.012878	\N	\N	4	29	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
485	Володимир Швець	shvets.volodymyr@lnu.edu.ua	$2a$06$qatF7RnGQJ5BcPQQ2dHy1eFJrc1yPVlvpt6Ce6U0S8UYBifuL/eTG	teacher	2025-11-05 13:07:29.012878	\N	\N	4	29	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
486	Лілія Вейкрута	veikruta.liliia@lnu.edu.ua	$2a$06$X/wJ9gZjXbcpz.l8bIUlBec4WWcqIrlr7T6NpEGzkxRmOQr7fPJBS	teacher	2025-11-05 13:07:29.012878	\N	\N	4	29	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
487	Олена Гамкало	hamkalo.olena@lnu.edu.ua	$2a$06$MsyaA/.4BZVYg0BxYehdc.Sg0.9hKrb8w8OOr5k4wSwETiRKU4JL6	teacher	2025-11-05 13:07:29.012878	\N	\N	4	29	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
488	Христина Демків	demkiv.khrystyna@lnu.edu.ua	$2a$06$bXw6NCQewMZGq82YLWRhzeHmLLMN6PjExR23c0pXaX1.rQArL8JMG	teacher	2025-11-05 13:07:29.012878	\N	\N	4	29	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
489	Олена Дубіль	dubil.olena@lnu.edu.ua	$2a$06$F6n9pPcWhj/efgMFZ.X0XuE4Y4u5lfoz775su05ZsIZN1uHblAxNq	teacher	2025-11-05 13:07:29.012878	\N	\N	4	29	\N	\N	f	\N	2025-11-05 13:07:29.012878	\N	\N	\N	\N
667	Михайло Ваньовський	vanovskyi.mykhailo@lnu.edu.ua	$2a$06$eWCAE5R.SbF5zbZkDs5MwOLEcxR4IxlUgsURt5jL7Jo4QKMtsLPRC	teacher	2025-11-05 13:13:21.680049	\N	\N	57	57	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
668	Олег Петрик	petryk.oleh@lnu.edu.ua	$2a$06$2bjRVJKUyv9rDGM.ofSp4uQDlmPSIIg/SPgdRv8jMrJ6vdrmnvhpC	teacher	2025-11-05 13:13:21.680049	\N	\N	57	57	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
669	Олег Кузик	kuzyk.oleh@lnu.edu.ua	$2a$06$.u/KOAQ6sPAj/F1S.Y9kXOlNgjmQBoNgwRVeTKLRzEG.G7BkN9dJm	teacher	2025-11-05 13:13:21.680049	\N	\N	57	57	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
670	Оксана Лань	lan.oksana@lnu.edu.ua	$2a$06$1DpNiXipPrT65Cuo17EiXeEXVeCiZGvTexYDnNNvq6aaUq4S/w.6m	teacher	2025-11-05 13:13:21.680049	\N	\N	57	57	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
671	Олександр Плахотнюк	plakhotniuk.oleksandr@lnu.edu.ua	$2a$06$Qug95gPwIHTXEIUayupGnOXNkWh8Ve5hy9qzgY/NAHOZBj4.eMi42	teacher	2025-11-05 13:13:21.680049	\N	\N	57	57	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
672	Андрій Яцеленко	yatselenko.andrii@lnu.edu.ua	$2a$06$D5hK0cAnWhxevJbYLmvuuOSs17P4IXSxKT101SmvieNkXiv81d5NG	teacher	2025-11-05 13:13:21.680049	\N	\N	57	57	\N	\N	f	\N	2025-11-05 13:13:21.680049	\N	\N	\N	\N
688	Оксана Гнаткович	hnatkovych.oksana@lnu.edu.ua	$2a$06$P.tv6K/qZA5RnLbBD4aaw.8kcywAqZAESHOTtdm6mafbREpbsvcOC	teacher	2025-11-05 13:16:09.432404	\N	\N	58	58	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
689	Наталія Данилиха	danylykha.nataliia@lnu.edu.ua	$2a$06$UfblLZb/t6Y6feom63hNQ.Xc/oH1LxIEe/bUo44u2BS96VvDmFt6C	teacher	2025-11-05 13:16:09.432404	\N	\N	58	58	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
690	Наталія Дядюх-Богатько	diadiukh-boratko.nataliia@lnu.edu.ua	$2a$06$0SNppabUTjjCuw3lvxYEHOEUytPfJ1czisnDK/A023pHqOTyLlvbS	teacher	2025-11-05 13:16:09.432404	\N	\N	58	58	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
691	Олена Баша	basha.olena@lnu.edu.ua	$2a$06$iYE4hxr5ydI1351lI32NM.gbBjJA7Bk44NDOLXqIHdKUeIQaR4Qc.	teacher	2025-11-05 13:16:09.432404	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
692	Олександра Бонковська	bonkovska.oleksandra@lnu.edu.ua	$2a$06$2CaBHY1i.CE.VXnR536rEOoaas4DNZRqOdZaCiY.0lecomZdLsLwa	teacher	2025-11-05 13:16:09.432404	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
693	Тетяна Каспрук	kaspruk.tetiana@lnu.edu.ua	$2a$06$QDoOfzxDhfxJq07eUAa7ee29MzWmMi9BKJFKHP.xAMOLuO.U0xYUm	teacher	2025-11-05 13:16:09.432404	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
694	Олександр Клековкін	klekovkin.oleksandr@lnu.edu.ua	$2a$06$jcuXCFkcv2ZY2AvoJbg3y.2mGOLjDJBRiMFnGQA4u42aWTXLY7c8C	teacher	2025-11-05 13:16:09.432404	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
695	Наталія Боймук	boimuk.nataliia@lnu.edu.ua	$2a$06$G6CgfjZ5lA1dDCHbjI.zzesGGzUoYEp.zSy9fQmkiFWTjY/zghpH.	teacher	2025-11-05 13:16:09.432404	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
696	Андрій Гаталевич	hatalevych.andrii@lnu.edu.ua	$2a$06$yvCDL4Qxtr/Xf/ktE6lq7.FiXJNQJ2CGWUu/PRVDfIg5fjv9UNfqG	teacher	2025-11-05 13:16:09.432404	\N	\N	69	69	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
697	Іван Васильків	vasylkiv.ivan@lnu.edu.ua	$2a$06$s4d0x8mLT/ohektnjx5RB.8D6HytKiUmr9aakxmKISc8vx8Vb6UsC	teacher	2025-11-05 13:16:09.432404	\N	\N	69	69	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
698	Ірина Верба	verba.iryna@lnu.edu.ua	$2a$06$0e1QiJtwoqCY53n9a43Py.5yFQzCXg1Sh1WjJxFP.eCQlGJNmg//i	teacher	2025-11-05 13:16:09.432404	\N	\N	69	69	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
699	Галина Зеліско	zelisko.halyna@lnu.edu.ua	$2a$06$k62/dx17KmHF9UNqWzaBUeiiLCdCbJQqJoM527Bva61pBqb6nqHwS	teacher	2025-11-05 13:16:09.432404	\N	\N	69	69	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
700	Марія Колінько	kolinko.mariia@lnu.edu.ua	$2a$06$X.iKHyg5.o6fEM919cKxjeGO5WG0cw6//jBjlF5iB/IQyvsD4a1MS	teacher	2025-11-05 13:16:09.432404	\N	\N	69	69	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
701	Володимир Синюта	syniuta.volodymyr@lnu.edu.ua	$2a$06$xHEacxvOVOsMhOICof8bTuy6R4HGTZzn8n.U9v6H./CcntXgwsiBe	teacher	2025-11-05 13:16:09.432404	\N	\N	69	69	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
702	Юрій Головатий	holovatyi.yurii@lnu.edu.ua	$2a$06$Qjt7Sq12dGUaa1zcP7PIu.Fyn1TwetmBpcGwqVgTI0NX83m8hi4Yq	teacher	2025-11-05 13:16:09.432404	\N	\N	67	67	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
703	Ярослав Єлейко	yeleiko.yaroslav@lnu.edu.ua	$2a$06$cQ7iUDRMP.gLlcPQTMZxp.lG07jshCvTU.4xw189T/R.uztx6qPBW	teacher	2025-11-05 13:16:09.432404	\N	\N	67	67	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
704	Ірина Базилевич	bazylevych.iryna@lnu.edu.ua	$2a$06$GTOZjGbd.QDwaiUeLgqMq.yT/9238DGqurdjso8CBECnxBm7ddblC	teacher	2025-11-05 13:16:09.432404	\N	\N	67	67	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
705	Тарас Бокало	bokalo.taras@lnu.edu.ua	$2a$06$RpnEo1avRfMJaOEoOr7aTeqeiZgRddxvGWc09cdl6AzRoyqnEhjuO	teacher	2025-11-05 13:16:09.432404	\N	\N	67	67	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
706	Костянтин Жерновий	zhernovyi.kostiantyn@lnu.edu.ua	$2a$06$mnKO5pVFU9hiWtetJHidyeGdvCcdpk0gyZFSMIgGUA4BgOWSee2GS	teacher	2025-11-05 13:16:09.432404	\N	\N	67	67	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
707	Оксана Ярова	yarova.oksana@lnu.edu.ua	$2a$06$IIBCtE8U.ziie6XtchQWcuWVwNT22p/chakcR01mC6crdFEtJKmle	teacher	2025-11-05 13:16:09.432404	\N	\N	67	67	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
708	Ігор Кузь	kuz.ihor@lnu.edu.ua	$2a$06$sARebFv5PbENwQTQHXK6cuXyPiJ/McLwqdop8qKKhQ.I8wgKlo6EG	teacher	2025-11-05 13:16:09.432404	\N	\N	68	68	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
709	Микола Слободян	slobodian.mykola@lnu.edu.ua	$2a$06$OfPWtnFHMUo/9ajgqGe02uHvqtLs0eu9OCabUVCt7gKl1hT5SS24q	teacher	2025-11-05 13:16:09.432404	\N	\N	68	68	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
710	Олег Скасків	skaskiv.oleh@lnu.edu.ua	$2a$06$o/rQcWmSU/V.h.YJ8aqgVutnDoqbf5ifJuvL7wL/QnWUSMML4kOd.	teacher	2025-11-05 13:16:09.432404	\N	\N	66	66	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
711	Ігор Чижиков	chyzhykov.ihor@lnu.edu.ua	$2a$06$ehN994A7mqpJAPLQKbnS8uFCpE5kaQkF6aeA0kk6MIl9bBX.SKoUa	teacher	2025-11-05 13:16:09.432404	\N	\N	66	66	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
712	Дзвенислава Луківська	lukivska.dzvenyslava@lnu.edu.ua	$2a$06$6ls9fRRyOHCNKE5SwF9Nl.5LahRfcc4NWQ4vFetodndz.LvTzWMl.	teacher	2025-11-05 13:16:09.432404	\N	\N	66	66	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
713	Ярослав Микитюк	mykytyuk.yaroslav@lnu.edu.ua	$2a$06$0THahJTluRTqJ75AxnoRgeH0.traq4Yc4V4JAbnMBlg3UWixjNDbe	teacher	2025-11-05 13:16:09.432404	\N	\N	66	66	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
714	Наталія Сущик	sushchyk.nataliia@lnu.edu.ua	$2a$06$.678/CwrTSjZWh48ZXA4FeqIT07M7MDEER1ZY/2s9L4Nwig3WPw0e	teacher	2025-11-05 13:16:09.432404	\N	\N	66	66	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
715	Тарас Банах	banakh.taras@lnu.edu.ua	$2a$06$ZNVJ.4PffjWOyFa4MTggAOQr4q12aN2NYbupYlUSxJeTWdmRZM7rS	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
716	Михайло Зарічний	zarichnyi.mykhailo@lnu.edu.ua	$2a$06$05MyYzEvAA68ihIHf3q5BO1gBkEivBm6wtQ.xwgWBgAJmc7F4Me2K	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
717	Богдан Бокало	bokalo.bohdan@lnu.edu.ua	$2a$06$GhTKuMnD7RmzuTeDXrzpt.ZQsou0nug5kYqAaMbJ3JIkwfNWbi04y	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
718	Олена Гринів	hryniv.olena@lnu.edu.ua	$2a$06$Lare4W06Z4io0FSt6iUAoeX0jKV6nGa3Ws/HO4MS2063dZwAJl12W	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
719	Ігор Гуран	huran.ihor@lnu.edu.ua	$2a$06$7fL138tujxqnl3.NoHb08uRMxPNQ9PR7xH2bGcvlcuYKkG349SU8G	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
720	Катерина Максимик	maksymyk.kateryna@lnu.edu.ua	$2a$06$8zbcPLGbdG5AM98fWNQfp.9uzYLS84W9nQmI76Er8JFh8sFJ25s/y	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
721	Ольга Попадюк	popadiuk.olha@lnu.edu.ua	$2a$06$PH05.bxeoCZEYi3UYcjCEeT7yyb/wrwh8Agzp5jdvuWHD7I2joYdu	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
722	Олег Романів	romaniv.oleh@lnu.edu.ua	$2a$06$szHIIJi1fCaI6s/k.TTUgeT3eIdoxqnpki2NpXkqrZjgbfo5pBU2C	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
723	Андрій Саган	sahan.andrii@lnu.edu.ua	$2a$06$pmwDXDkZ..gU9xxPBYrsp.LRhkyF1vXf1C/oktedZciDm7Yl6NuXq	teacher	2025-11-05 13:16:09.432404	\N	\N	60	60	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
724	Іван Брацук	bratsuk.ivan@lnu.edu.ua	$2a$06$.flmR3nyLrybq2aK99plQ.d5lOsWY4HQLu3GBLtF0kuvuDTVMyaga	teacher	2025-11-05 13:16:09.432404	\N	\N	76	76	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
725	Оксана Головко-Гавришева	holovko-havrysheva.oksana@lnu.edu.ua	$2a$06$O7bPI.mPUjyQXTxyMhaobeR/M1kJzJvAdNN7QRBfCgqya10WXDjqq	teacher	2025-11-05 13:16:09.432404	\N	\N	76	76	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
726	Святослав Сеник	senyk.sviatoslav@lnu.edu.ua	$2a$06$T60ard2aOLhuVeXpX8427uyHKnUW27ftY9bCXYJzGIK38Fy/oyfku	teacher	2025-11-05 13:16:09.432404	\N	\N	76	76	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
727	Юлія Утко-Масляник	utko-maslynyk.yuliia@lnu.edu.ua	$2a$06$OmHe7eJaM.fM9TKAJnSfF.d6TGHTKQw4jJN0BbR2mVEqOL1jDx6LS	teacher	2025-11-05 13:16:09.432404	\N	\N	76	76	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
728	Ірина Яворська	yavorska.iryna@lnu.edu.ua	$2a$06$IalwUL5tf98dJh8jdpTRduBlph563hMhu04Txd8.SOhjTXbphqFwW	teacher	2025-11-05 13:16:09.432404	\N	\N	76	76	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
731	Юрій Присяжнюк	prysiazhniuk.yurii@lnu.edu.ua	$2a$06$oVw8BqnqJT8Q2VUIPkk0WuKC/crwDWKzGlx61IhL75FJ7ceXRRDe.	teacher	2025-11-05 13:16:09.432404	\N	\N	74	74	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
732	Михайло Комарницький	komarnytskyi.mykhailo@lnu.edu.ua	$2a$06$/wmLfBxAL5P7ZSj.qpuNjO0cR8wBEEZuDTWq9XN3CrdkD.7AMltRK	teacher	2025-11-05 13:16:09.432404	\N	\N	74	74	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
733	Петро Кузик	kuzyk.petro@lnu.edu.ua	$2a$06$8HHe.zVKARVftkUPWRHmsuDlOgetbKHUufhyScG4mdbR3e55zQ08K	teacher	2025-11-05 13:16:09.432404	\N	\N	74	74	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
734	Борис Сулим	sulym.borys@lnu.edu.ua	$2a$06$gVe.fUy8ybKwsobsmNFDhOAS/jiMCyD2AzFxRdE6hTo47RbCJ4X7a	teacher	2025-11-05 13:16:09.432404	\N	\N	74	74	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
735	Ольга Теленко	telenko.olha@lnu.edu.ua	$2a$06$IB/TLmZtrbCONCkBS3cdouFjHTkR0SSeU27QJMQbbw4iCvUa2aJhq	teacher	2025-11-05 13:16:09.432404	\N	\N	74	74	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
736	Світлана Писаренко	pysarenko.svitlana@lnu.edu.ua	$2a$06$pA4O8sdaDlu3QJZRzDQvkOuApCLLsXbj2.zKujm3IJgP8/RCFt9nu	teacher	2025-11-05 13:16:09.432404	\N	\N	71	71	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
737	Лілія Українець	ukrainets.liliia@lnu.edu.ua	$2a$06$SribFplKNb6eTGyedoQR4u7ZPOfKzmUWwe5lxiRlkEVU7EtqaW5Ma	teacher	2025-11-05 13:16:09.432404	\N	\N	71	71	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
738	Наталія Горін	horin.nataliia@lnu.edu.ua	$2a$06$UmWlnXYhqGWUlE4MCS8HF.XJRNN40QS8YXiiDYj3IySC3AQCR1xeu	teacher	2025-11-05 13:16:09.432404	\N	\N	71	71	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
739	Роман Москалик	moskalyk.roman@lnu.edu.ua	$2a$06$8OHfvqsIVuvwMzCCUyOXR.zsn8QIRboQGcRImqSpQBFQRn6XkKh6u	teacher	2025-11-05 13:16:09.432404	\N	\N	71	71	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
740	Андрій Пехник	pekhnyk.andrii@lnu.edu.ua	$2a$06$FmJFtCsWaOJadQC9DVjFuOAZj08ID2nIWI/3XnDrsMcKFa/WX491a	teacher	2025-11-05 13:16:09.432404	\N	\N	71	71	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
741	Василь Репецький	repetskyi.vasyl@lnu.edu.ua	$2a$06$tIF98/BPEg77gKHGCC5XQOV3Y35XWFLIErfEpwP0iGiRaAS6VXpJm	teacher	2025-11-05 13:16:09.432404	\N	\N	70	70	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
742	Михайло Грабинський	hrabynskyi.mykhailo@lnu.edu.ua	$2a$06$FcF5GDevoBTQ0EPKPa7Vvuxo7rwX.RIvWpm/Onr5QfF4zcLAZzBF6	teacher	2025-11-05 13:16:09.432404	\N	\N	70	70	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
743	Ігор Земан	zeman.ihor@lnu.edu.ua	$2a$06$lVKXa7ACLwXiR8OAT6YiTeRpUrRX6OHntCpExEIziK821LtPsgM02	teacher	2025-11-05 13:16:09.432404	\N	\N	70	70	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
744	Антоніна Зубарева	zubareva.antonina@lnu.edu.ua	$2a$06$i69daOffwhMoJeEHq7R7sOvVi0J9tElkX.gPeexNtFdP0hiciuCOi	teacher	2025-11-05 13:16:09.432404	\N	\N	70	70	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
745	Володимир Лисик	lysyк.volodymyr@lnu.edu.ua	$2a$06$bxZ7pf7YE9SKiMB0MSG7x.D8PdByv9rJEt69DA6Xf.FGvM/txKAra	teacher	2025-11-05 13:16:09.432404	\N	\N	70	70	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
572	Олег Сінькевич	sinkevych.oleh@lnu.edu.ua	$2a$06$SW8VytDE5JFXW.EEe8b/9e29Foej4ghafF2CQ9/RyOn3oA9vCm69e	teacher	2025-11-05 13:10:04.072109	\N	\N	5	33	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
573	Богдан Соколовський	sokolovskyi.bohdan@lnu.edu.ua	$2a$06$Fd741qFRIXNv2RaiTJrTueK/u/QDH18fXg28dPKwUbpaV2NpPNU7a	teacher	2025-11-05 13:10:04.072109	\N	\N	5	33	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
578	Марія Назаркевич	nazarkevych.mariia@lnu.edu.ua	$2a$06$oionT7EXk1joOta6WkDcm.TsXMU/XR51OxA5CevbvvPj0lbF7OEPu	teacher	2025-11-05 13:10:04.072109	\N	\N	5	34	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
579	Богдан Коман	roman.bohdan@lnu.edu.ua	$2a$06$FnZQRiTxo0zh3z4UQBB.DOrW273/ny.CfmkMMu8NrsPeN.GdInMKS	teacher	2025-11-05 13:10:04.072109	\N	\N	5	35	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
581	Ірина Олінська	olinska.iryna@lnu.edu.ua	$2a$06$9.A2Quh2KAfH.n7U080/wOBHLg.uU6DuSqjLfkrcuBQTPT1uejY1K	teacher	2025-11-05 13:10:04.072109	\N	\N	10	68	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
584	Мар'ян Житарюк	zhyvoriuk.marian@lnu.edu.ua	$2a$06$rqgRFGZ1XOmRdOOYE4PTb.HgAktaUcWpsBdg/RGP0HashoM7hKbgm	teacher	2025-11-05 13:10:04.072109	\N	\N	6	38	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
585	Тарас Лильо	lylio.taras@lnu.edu.ua	$2a$06$NvEkDTWR5Zg6x5amNl/r8.uSe5zCVF.IgDhYpunFsmS5JxRdYvequ	teacher	2025-11-05 13:10:04.072109	\N	\N	6	38	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
586	Андрій Мельник	melnyk.andrii@lnu.edu.ua	$2a$06$UrcMYk733pdOFh4HQIOJPuf26YtBVKN15kI79ow.juKMzS6iI8TI6	teacher	2025-11-05 13:10:04.072109	\N	\N	6	38	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
587	Тетяна Хоменко	khomenko.tetiana@lnu.edu.ua	$2a$06$My4khA/4hV.PwwlkVvO.aeB9v.okDKwTs5DH15v4Co0eR3Fqr1jCu	teacher	2025-11-05 13:10:04.072109	\N	\N	6	38	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
588	Христина Дацишин	datsyshyn.khrystyna@lnu.edu.ua	$2a$06$MUojHE7ruotCpWEuQmlX1ehwmymhebeRm/gNGw2vWAqJ1W/wvUhv2	teacher	2025-11-05 13:10:04.072109	\N	\N	6	39	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
589	Любов Конюхова	koniukhova.liubov@lnu.edu.ua	$2a$06$AoE5FMOY24REqFcxsniRDuQ3YxE3C3EKVoRGEZM69ApuC7LBGDN22	teacher	2025-11-05 13:10:04.072109	\N	\N	6	39	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
590	Андрій Яценко	yatsenko.andrii@lnu.edu.ua	$2a$06$jfY4JrQsJ2O6kbq3bDFKk.iUAH16xKA/dTeogUgVkAzRjf8/eE08i	teacher	2025-11-05 13:10:04.072109	\N	\N	6	39	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
591	Степан Кость	kost.stepan@lnu.edu.ua	$2a$06$/KnaZEHN/S6/B17plWaGr.L9YvTjTbihmpCtQknC1cRMLpkpxsqJ6	teacher	2025-11-05 13:10:04.072109	\N	\N	6	40	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
592	Соломія Онуфрів	onufriv.solomiia@lnu.edu.ua	$2a$06$jOh0dev4bMMADadrpqmrmu./KUnv9Pnau8khdJpwKVqVaqZnll73W	teacher	2025-11-05 13:10:04.072109	\N	\N	6	40	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
593	Ігор Паславський	paslavskyi.ihor@lnu.edu.ua	$2a$06$zqjf7H0awoAC8xzFVkboO.3ulV18qbVGR1YuT4x460hDA1K0Fktca	teacher	2025-11-05 13:10:04.072109	\N	\N	6	40	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
594	Олег Романчук	romanchuk.oleh@lnu.edu.ua	$2a$06$sVY5MJjc43rJPoHZ7ZoHFOC4e8IB4YtrDKLuIk1UjIuVY8dpqlv2u	teacher	2025-11-05 13:10:04.072109	\N	\N	6	40	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
595	Галина Яценко	yatsenko.halyna@lnu.edu.ua	$2a$06$TmjSivO.mMdbeosYgxBEduZtDcqZgDFQmE3ov..ob16/GnzZ2pFKi	teacher	2025-11-05 13:10:04.072109	\N	\N	6	40	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
596	Іван Бехта	bekhta.ivan@lnu.edu.ua	$2a$06$PsTJTL/5D4Z6R5YO0k6uI.1se4zbWLjm5RrgGfU495Z0UtBYllXIm	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
597	Людмила Бабійчук	babiichuk.lyudmyla@lnu.edu.ua	$2a$06$TUsjcr/HK1HIMHo1.uZXOOvt19VxVe/RWDGOpMelJXhQb2d0lrgcC	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
598	Глорія Бернар	bernard.hloriia@lnu.edu.ua	$2a$06$8c5bMh2P/FZVGHl5DGF.DuWYDZC8KBZ8hL/6x49UGjdG/SgOqRrya	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
599	Світлана Войтюк	voitiuk.svitlana@lnu.edu.ua	$2a$06$xXpSGeC9IWvQ48M6esFcXuUpHYucb5lWqLZ34aybx3hNfFZ/VSzUK	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
600	Оксана Гураль	hural.oksana@lnu.edu.ua	$2a$06$H..M/ui7bkaPoVwF2dFp8O6gfRvZpstMeAj4c.T41/qNwpJB5dzfS	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
916	Ольга Галюка	haliuka.olha@lnu.edu.ua	$2a$06$pR2DlKXAN8Z8cf5Cq90YjOeR3no5EopGhbuJ2ELp7Bu9qUr9hThgW	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
575	Василь Рабик	rabyk.vasyl@lnu.edu.ua	$2a$06$hdY6msiqXMoemSaEb4vLousfza.Et8J/qr.xYN/R9kGfqKwIQ1GG.	teacher	2025-11-05 13:10:04.072109	2025-12-28 13:42:01.006102	\N	5	34	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
601	Олександра Дейчаківська	deichakivska.oleksandra@lnu.edu.ua	$2a$06$9zLZ/vhXsSf49ijafUzcNOYRZq49qcBH4uAY5uSoEJRum.y6QkTUu	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
602	Юрій Завгороднєв	zavhorodniv.yurii@lnu.edu.ua	$2a$06$FUrUoA6jlOSUi1fgF4T.kuOTxf2AboxpZiXlIp4CJa2s/xCrwdUkW	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
603	Світлана Івашків-Когут	ivashkiv-kohut.svitlana@lnu.edu.ua	$2a$06$w5WZe91lGoDXIjfsBoiMzuv5cHUcMdjfKjfRspuaO5W4XpVpPPgG2	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
604	Леся Кінаш	kinash.lesia@lnu.edu.ua	$2a$06$v8/z5Xh.lE3MXzcLy8i3Eu99mgWLFUexVAQhhYTtKpj.A2UuRP21S	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
605	Христина Кунець	kunets.khrystyna@lnu.edu.ua	$2a$06$pWE7bKmXUq2hSWKSH9PnRO6j34KfrmaUxrzCg2KnIdvB/O4RtSmRm	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
606	Олеся Ладницька	ladnytska.olesia@lnu.edu.ua	$2a$06$zjUnOTjnzcOR2OXlra7ODua4sTbzHdtnaFOMqQjRA7ZWPb/N4qCqa	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
607	Кароліна Лотоцька	lototska.karolina@lnu.edu.ua	$2a$06$o61uk4j0gXSn5ZYQHSx9w.t89vyDXAlCeRmA0D5TIJqCkCUt4SgIu	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
571	Роман Рабош	rabosh.roman@lnu.edu.ua	$2a$06$Omo1bxtA1FIPM68ecTX3dus8ICIyGTsufw.VNyB/EmhMJLGh7/Jra	teacher	2025-11-05 13:10:04.072109	2025-11-13 22:22:35.268329	2025-11-13 22:22:56.112969	5	33	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
608	Олена Оленюк	oleniuk.olena@lnu.edu.ua	$2a$06$fUMW5Sa3alv.sd0ojHj3aONYJfqhTFNp6gCYtiHxEdeQqhrw7jKZi	teacher	2025-11-05 13:10:04.072109	\N	\N	7	41	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
609	Ліна Глущенко	hlushchenko.lina@lnu.edu.ua	$2a$06$Jvh/6kp6oF.2Z5wtfv4H6uCXFBZXVu/cv7UXrxz0kAHGRuqKcDdxy	teacher	2025-11-05 13:10:04.072109	\N	\N	7	42	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
610	Маркіян Домбровський	dombrovskyi.markiian@lnu.edu.ua	$2a$06$cWYvzQoN9vKl1fNr2q24QuETw5Om1wlznOt57GvafFoLgsFvgalJO	teacher	2025-11-05 13:10:04.072109	\N	\N	7	42	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
611	Святослав Зубченко	zubchenko.sviatoslav@lnu.edu.ua	$2a$06$XBeDEd7OVplX6wuOobKeReeaamtv0bCet260U2HonYmA2h4ftfQLi	teacher	2025-11-05 13:10:04.072109	\N	\N	7	42	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
612	Ольга Назаренко	nazarenko.olha@lnu.edu.ua	$2a$06$bQeISJXHoAnGWlON0gv7EuCtls.C050HbGb2ZLQQ1AAYV5HeiBWcm	teacher	2025-11-05 13:10:04.072109	\N	\N	7	42	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
613	Ольга Пилипів	pylypiv.olha@lnu.edu.ua	$2a$06$mhjXJ6poO7Ng0h84B9L9oOKHZ8YSveTZYJn1nQ5SXyderqE.9si9S	teacher	2025-11-05 13:10:04.072109	\N	\N	7	42	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
614	Андрій Савула	savula.andrii@lnu.edu.ua	$2a$06$UMQE9/XmIPffQ5c06vZVkOJgsRvwQITs1S98t3yGKePP4dbJ6Wmfe	teacher	2025-11-05 13:10:04.072109	\N	\N	7	42	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
615	Наталія Петращук	petrashchuk.nataliia@lnu.edu.ua	$2a$06$XMOAH9YZjPf//tuz2C.VOubFn4l4rR0S8Wkb65DCafUoyOp3JADae	teacher	2025-11-05 13:10:04.072109	\N	\N	7	43	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
616	Світлана Маценка	matsenka.svitlana@lnu.edu.ua	$2a$06$pBCgSM4xBdRlJpWNwWho1.RC7.w2GLZq3vc7QMr50S/9COEQIxjpi	teacher	2025-11-05 13:10:04.072109	\N	\N	7	43	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
617	Юлія Бєлозьорова	biloziorova.yuliia@lnu.edu.ua	$2a$06$Kf6.8qc6QBiXZqeOwfHiFe0yN7o7jEwSFklOJM8vbL56iKefZ6CLW	teacher	2025-11-05 13:10:04.072109	\N	\N	7	43	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
618	Галина Котовські	kotovski.halyna@lnu.edu.ua	$2a$06$a7PRr1wEzQZOTC1RiaaHPuaca4ZfFY0OXUB/94Hb370AqECe6BBcu	teacher	2025-11-05 13:10:04.072109	\N	\N	7	43	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
619	Юлія Микитюк	mykytyuk.yuliia@lnu.edu.ua	$2a$06$VVwWY1gXS44Bw70D1HhVS.g32DloCEyZaprXhDGKPUs2xcgzJ.Tka	teacher	2025-11-05 13:10:04.072109	\N	\N	7	43	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
620	Христина Назаркевич	nazarkevych.khrystyna@lnu.edu.ua	$2a$06$nH2xbk.sD.1YvqsuH6qPjOTzPIbetRKO0EQAfMwSFK/rZnNerl5fa	teacher	2025-11-05 13:10:04.072109	\N	\N	7	43	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
621	Юрій Теребушко	terebushko.yurii@lnu.edu.ua	$2a$06$Mr9OU8mDlj0AM86LjBGhAuCHdhBnpGuu8PYqfHqQdclwlXAp8KPX2	teacher	2025-11-05 13:10:04.072109	\N	\N	7	43	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
622	Лідія Мацевко-Бекерська	matsevko-bekerska.lidiia@lnu.edu.ua	$2a$06$72SakInd0loLPXdesvqKTOeJxJIUaHjZ8y3sYpru18kSC.kEvtkDq	teacher	2025-11-05 13:10:04.072109	\N	\N	7	44	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
746	Олександр Кучик	kuchyk.oleksandr@lnu.edu.ua	$2a$06$L5kKtOna5XNQQQJcwRw2pe1hXId01EzBNt/Pl8GE86k9rSI8lnp2K	teacher	2025-11-05 13:16:09.432404	\N	\N	75	75	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
747	Богдан Гудь	hud.bohdan@lnu.edu.ua	$2a$06$jI4wo6p6oKywr1Zrze9PFuasXIp4Zbalbhkgwqx2B0CpPpOz89ul6	teacher	2025-11-05 13:16:09.432404	\N	\N	75	75	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
748	Маріанна Гладиш	hladysh.marianna@lnu.edu.ua	$2a$06$pR8Pm1MVj2Q7ycAUpzw0Fe8o60oHggy6BDgUnZUigGXTOLDEIqdGK	teacher	2025-11-05 13:16:09.432404	\N	\N	75	75	\N	\N	f	\N	2025-11-05 13:16:09.432404	\N	\N	\N	\N
904	Наталія Шалєнна	shalenna.nataliia@lnu.edu.ua	$2a$06$Bvt4Qk09BRI37jJuzkIKD.LU4oD2j6kBXoBdaA/bXK1TDfIXoWduW	teacher	2025-11-05 13:20:07.598583	\N	\N	75	75	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
905	Олексій Караманов	karamanov.oleksii@lnu.edu.ua	$2a$06$YvXy3pUWBnzZQIwejw1nSesaAoMemvdO4wISJiAEnY5IUOI/J1O3.	teacher	2025-11-05 13:20:07.598583	\N	\N	77	77	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
906	Ольга Осередчук	oseredchuk.olha@lnu.edu.ua	$2a$06$2cksVuXd5rYLtrs.4pHNMe8M444Kp3zk7zpDFPo8BoXAUzdoAiYwO	teacher	2025-11-05 13:20:07.598583	\N	\N	77	77	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
907	Дмитро Герцюк	hertsiuk.dmytro@lnu.edu.ua	$2a$06$oQE1L.7.SGOYDhM.4awIyObUD0sm1cRcarZ3rq.AgTg6te6u1X98i	teacher	2025-11-05 13:20:07.598583	\N	\N	77	77	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
908	Валентина Загрева	zahreva.valentyna@lnu.edu.ua	$2a$06$iZi9XUoajg8SVWHgp1KbfeXFaPC5kvWR2KdBS19/VYDdUOe0DZkm2	teacher	2025-11-05 13:20:07.598583	\N	\N	77	77	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
909	Юлія Заячук	zaiachuk.yuliia@lnu.edu.ua	$2a$06$BQhMNJjK3GUpgmh93R0k9.C0yeaug4BkIltPuFPt/JjM4y7wOqpoC	teacher	2025-11-05 13:20:07.598583	\N	\N	77	77	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
910	Христина Калагурка	kalahurka.khrystyna@lnu.edu.ua	$2a$06$FtMBlvo8Pak5QAHHg.sl0ed61T.W6hrYBJ6XuA4PyCWpEMOk7ocpG	teacher	2025-11-05 13:20:07.598583	\N	\N	77	77	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
911	Лариса Ковальчук	kovalchuk.larysa@lnu.edu.ua	$2a$06$rFVlnJF39cf6Tm5GxOfUmuCq1IkuqUXdc9/.T4ivWOWiuIPGDhLo2	teacher	2025-11-05 13:20:07.598583	\N	\N	77	77	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
912	Марія Крива	kryva.mariia@lnu.edu.ua	$2a$06$25zZIwByJSKQ4HDoxHFVkO9fb.meI6sQBDVdbfxT06XWL6RaFeSC.	teacher	2025-11-05 13:20:07.598583	\N	\N	77	77	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
913	Олена Галян	halian.olena@lnu.edu.ua	$2a$06$9nHA6rzugEdgCZGp6GI2jeWbsr6whNWDAVyiXLVAiDLSuaxGOfZLa	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
914	Галина Бойко	boiko.halyna@lnu.edu.ua	$2a$06$AMTvdLgEYA9e/FFIODHGI.B.rDTY2dxGlI1XqBZ.bMCBsf7wE.wji	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
915	Наталія Вінарчук	vinarchuk.nataliia@lnu.edu.ua	$2a$06$.Dukg5SHr0A.uOD7RZdwGu/GJ/I4Ifq8duld0lBznr/jJGO0eGdXq	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
917	Юлія Денисяк	denysiak.yuliia@lnu.edu.ua	$2a$06$EITS2ucmLswxBKZ5/4/hMOmHDomo6IFbfA93PXrYGhM7sHyjiaVn2	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
918	Юлія Деркач	derkach.yuliia@lnu.edu.ua	$2a$06$BEEWv6UBlU4lOw5oIFa9z.LjBpj7aYYo0nSfdu3rNvbuXC/p5dlxO	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
919	Людмила Кобилецька	kobyletska.liudmyla@lnu.edu.ua	$2a$06$m7M85C4svCEIgptapAyeT.PnqXT/uGsSgIf02CZIqCo2g0uG/Ecsm	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
920	Галина Крохмальна	krokhmalna.halyna@lnu.edu.ua	$2a$06$Dpengcgt9dON0ZM97hf2Iuii8tkJM.q9E9GYj4hDvSR4ls775zlvu	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
921	Світлана Лозинська	lozinska.svitlana@lnu.edu.ua	$2a$06$Lbr6q5Wpz2QxopBM1vCu8uaOHEWd9kHOvXBAQDhnposVoc0SIoslK	teacher	2025-11-05 13:20:07.598583	\N	\N	78	78	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
922	Віра Корнят	korniat.vira@lnu.edu.ua	$2a$06$0T8cNP7r.gxL.P3F1U9cIOF7UH13jsv6Ymwl.krX5lz646/lJglk.	teacher	2025-11-05 13:20:07.598583	\N	\N	79	79	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
923	Ірина Зубрицька-Макота	zubrytska-makota.iryna@lnu.edu.ua	$2a$06$sZa6F.eGtboDGIw8XoBFHO9Gnjrc2vA1W7t9ExvzPYZBMV2F3xVf.	teacher	2025-11-05 13:20:07.598583	\N	\N	79	79	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
924	Вікторія Лобода	loboda.viktoriia@lnu.edu.ua	$2a$06$t9W2sEjRkZwIRfHhp88yquoFWNrgO.apkPIwaPZRiIlH74zyQjWq.	teacher	2025-11-05 13:20:07.598583	\N	\N	79	79	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
925	Алла Марчук	marchuk.alla@lnu.edu.ua	$2a$06$fbK6RQQN4OdzlyQDfzi9q.Pj4xtmav5G6mMw1ohxL9wcYTrVMeBPO	teacher	2025-11-05 13:20:07.598583	\N	\N	79	79	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
926	Ольга Столярик	stoliaryk.olha@lnu.edu.ua	$2a$06$MNku6Ub3JiJwTWtj74Qk9e8ei5WrTCpNp.WwGEQLOCmOYMpOxkRji	teacher	2025-11-05 13:20:07.598583	\N	\N	79	79	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
927	Ярина Танчак	tanchak.yaryna@lnu.edu.ua	$2a$06$c1YttGJXLL3Vo.5PaFwcmue1YPrHpj1psPlmG4PGUZsZo7pFWWZSO	teacher	2025-11-05 13:20:07.598583	\N	\N	79	79	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
928	Юрій Щербина	shcherbyna.yurii@lnu.edu.ua	$2a$06$bFMCwiL/9hCz10YpNY0rIO9B0CuX7i.kT8jL2.g9Qa1OyaJFik/d.	teacher	2025-11-05 13:20:07.598583	\N	\N	88	88	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
929	Галина Квасниця	kvasnytsia.halyna@lnu.edu.ua	$2a$06$ieieFNlSndCRETBH1SZxR.h9OiEmUHP69i5Iytrue5FodyR3A7ulS	teacher	2025-11-05 13:20:07.598583	\N	\N	88	88	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
930	Ярина Коковська	kokovska.yaryna@lnu.edu.ua	$2a$06$kiWzsygd2Xvjba1VVxJNd.RkrZt7XqICGE6jrVacfIw/XWKnqFj3C	teacher	2025-11-05 13:20:07.598583	\N	\N	88	88	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
931	Надія Колос	kolos.nadiia@lnu.edu.ua	$2a$06$M9krDuIC1MNy5XTzw5Tpv.8oQJCb9aMNPk1mz3TygdRLFwrTWSYx2	teacher	2025-11-05 13:20:07.598583	\N	\N	88	88	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
932	Ольга Пелюшкевич	peliushkevych.olha@lnu.edu.ua	$2a$06$90n1QXV8GlsMrgBcj7KKtOwuCDZBJ93oBCEUsJI4Lx5EcmbtV8f32	teacher	2025-11-05 13:20:07.598583	\N	\N	88	88	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
933	Інна Позднякова	pozdniakova.inna@lnu.edu.ua	$2a$06$fubdsraDpOU8oSD.zUvdQumJbiqGZOK1XUNY8.g6OG0zarnvk15da	teacher	2025-11-05 13:20:07.598583	\N	\N	88	88	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
934	Ярослав Соколовський	sokolovskyi.yaroslav@lnu.edu.ua	$2a$06$oLNsByHW2taqJiN/jcMnX.jjBnHAzS2zRuAO8a5xCVToZNX3FzXWe	teacher	2025-11-05 13:20:07.598583	\N	\N	86	86	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
935	Михайло Яджак	yadziak.mykhailo@lnu.edu.ua	$2a$06$rXLArOS8F5LbesS53nSKmOphdXEUR8jcFOu8Fj4dECahwn0PBbv12	teacher	2025-11-05 13:20:07.598583	\N	\N	86	86	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
936	Володимир Вовк	vovk.volodymyr@lnu.edu.ua	$2a$06$SL.PQ2sG3w2gc.b3Bk4nuO7k2rpSVCzgmbeHhMubM/jZ72ObGsS6q	teacher	2025-11-05 13:20:07.598583	\N	\N	86	86	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
937	Ірина Козій	kozii.iryna@lnu.edu.ua	$2a$06$iepIDBECE7Nm1aX146TGHuuDqdnQ.cJI6rau2lWlYm4pV7aoJxU3i	teacher	2025-11-05 13:20:07.598583	\N	\N	86	86	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
938	Петро Венгерський	venherskyi.petro@lnu.edu.ua	$2a$06$OByT7XcoEyXsTLxOwEhZE.Cc56SUjAJY9ak2BAhfpycWUF69RhiN2	teacher	2025-11-05 13:20:07.598583	\N	\N	89	89	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
939	Мар'ян Кирик	kyryk.marian@lnu.edu.ua	$2a$06$6aX0Ymgf3cX5ulM6liDHf.CIxTAdjXQjQKIlEQAARAy3tecHs3M.6	teacher	2025-11-05 13:20:07.598583	\N	\N	89	89	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
941	Тарас Брич	brych.taras@lnu.edu.ua	$2a$06$fQeA4ULs1EtHkYtCP.0vwuHI1N9ok0gqiC9WcgM.1PEETKGEoD.bC	teacher	2025-11-05 13:20:07.598583	\N	\N	89	89	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
942	Олександра Гірна	hirna.oleksandra@lnu.edu.ua	$2a$06$6Pe5XbI0zKGzUAlCPemZj.nDDrE3NaGofJvfpPEvJyayCqtKJZFOS	teacher	2025-11-05 13:20:07.598583	\N	\N	89	89	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
943	Даниїл Журавчак	zhuravchak.danyil@lnu.edu.ua	$2a$06$HMO/5YBT3Cmt5r2A.smXhux9DJJmcp5qpg2lhJw0ElgyFJveIT.tm	teacher	2025-11-05 13:20:07.598583	\N	\N	89	89	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
944	Іван Прокопишин	prokopyshyn.ivan@lnu.edu.ua	$2a$06$9Q9duqCa0RmWeygXFTEaiuhMPKEUyivqZZ8F6lQVfb7htYXeLjW0q	teacher	2025-11-05 13:20:07.598583	\N	\N	89	89	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
945	Валерій Трушевський	trushevskyi.valerii@lnu.edu.ua	$2a$06$SEuFBsy70zNQJdxMqLx8ZuZYicIZ6TYcyaRq0/NmzqaP9VrE4eWEW	teacher	2025-11-05 13:20:07.598583	\N	\N	89	89	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
947	Юрій Токовий	tokovyi.yurii@lnu.edu.ua	$2a$06$zXW6TaraDE/xJI1xpjiGB.e417z0W41QgP10PQikwAwkOn8LQFpOi	teacher	2025-11-05 13:20:07.598583	\N	\N	83	83	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
948	Лілія Дяконук	diakonuk.liliia@lnu.edu.ua	$2a$06$yPfrRi7Mpj6bBFwSbJ3WD.BzxwVdBSlF0n0WlybYonWktEdO./doK	teacher	2025-11-05 13:20:07.598583	\N	\N	83	83	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
949	Ігор Макар	makar.ihor@lnu.edu.ua	$2a$06$.9vFdgH/Ea6gO2NdW9Hq3uHdbBA.nDSsM3isa/arY8wnmb0Yg701S	teacher	2025-11-05 13:20:07.598583	\N	\N	83	83	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
950	Андрій Переймибіда	pereimibida.andrii@lnu.edu.ua	$2a$06$YGi7CDcIZl9SXoheXa022.HKh/Yd0PWGUglD5PRllOS.DdP9DNQoG	teacher	2025-11-05 13:20:07.598583	\N	\N	83	83	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
951	Любомир Чирун	chyrun.liubomyr@lnu.edu.ua	$2a$06$LD5HOGXFwMvxtDxg3UPiO.ZHAQsCOKqnfeUqJXdRJk.MSOytMxElC	teacher	2025-11-05 13:20:07.598583	\N	\N	83	83	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
952	Тарас Заболоцький	zabolotskyi.taras@lnu.edu.ua	$2a$06$DmCVat1lUUJ8yd3ZCQ7AdeWuL7tR0x12ZcK7OJ0QdllSok1nHi.N.	teacher	2025-11-05 13:20:07.598583	\N	\N	85	85	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
953	Андрій Голова	holova.andrii@lnu.edu.ua	$2a$06$GJwig8VAg80Q8WjfUkQ9deL.ntAK/2RMnDZ0azf9AYCqT94qBQvMu	teacher	2025-11-05 13:20:07.598583	\N	\N	85	85	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
954	Леся Клакович	klakovych.lesia@lnu.edu.ua	$2a$06$aG.79xUdQE2joGWmVjkTF.J6YcKcN8GN6nNKdA8auRe/ltUVJ6bay	teacher	2025-11-05 13:20:07.598583	\N	\N	85	85	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
955	Романна Малець	malets.romanna@lnu.edu.ua	$2a$06$M1U2ZFqbUo4JbMwsMW1kHuSoTdASU9qDLY4qtX/sBhRiAvvcJLt2G	teacher	2025-11-05 13:20:07.598583	\N	\N	85	85	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
956	Юрій Сибіль	sybil.yurii@lnu.edu.ua	$2a$06$Q.EWWoLkYY5w/f5Di4F/m.q9PxLJikQpRJPdBCJMbgFcV7rXikI0u	teacher	2025-11-05 13:20:07.598583	\N	\N	85	85	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
957	Галина Капленко	kaplenko.halyna@lnu.edu.ua	$2a$06$8jSX4p4sCmArNTGUBMaAxOC6Xn/OfMTE1y8YbJXUaUhcQYgw4ELve	teacher	2025-11-05 13:20:07.598583	\N	\N	90	90	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
958	Мар'яна Біль	bil.mariana@lnu.edu.ua	$2a$06$WGYJWi5EoEJLSwW55lmp1.FaR6cpbNey8Dqqf/ddeov.1PPr0I2m2	teacher	2025-11-05 13:20:07.598583	\N	\N	90	90	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
959	Людмила Матвейчук	matveichuk.liudmyla@lnu.edu.ua	$2a$06$hrXj362FASUXNhmpGIejg.HKaS4QCZyQdgfRqRFvAhfXMcpYjHN32	teacher	2025-11-05 13:20:07.598583	\N	\N	90	90	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
960	Іван Парубчак	parubchak.ivan@lnu.edu.ua	$2a$06$c6hsfp0w4NMhJ14YqZWY5uiV1cZpwnpRKRP/U2ClXU888Dqr61ZAK	teacher	2025-11-05 13:20:07.598583	\N	\N	90	90	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
961	Іван Базарко	bazarko.ivan@lnu.edu.ua	$2a$06$p0VOSIedrTqCjj85Wi43XOLSOGMCkMW3XOT57WoMLF86VfS6cqKWe	teacher	2025-11-05 13:20:07.598583	\N	\N	90	90	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
962	Ярослав Конопля	konoplia.yaroslav@lnu.edu.ua	$2a$06$8nw7EfGAa2i43OTU5rJMLOlZ31QUBhvsdexG0eOJUriW.LUZ.yKce	teacher	2025-11-05 13:20:07.598583	\N	\N	90	90	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
963	Інна Куліш	kulish.inna@lnu.edu.ua	$2a$06$Mccew0PbYPzkM1IRlGCyRemmkc9GwLtsyYLRfOkn6r8vDOVOWNoAm	teacher	2025-11-05 13:20:07.598583	\N	\N	90	90	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
964	Наталія Пак	pak.nataliia@lnu.edu.ua	$2a$06$7lvjz7uhkF7sz7/P6vvo5eLHHIEHhMYs23ZhuLukx5vXbkcBIfV7S	teacher	2025-11-05 13:20:07.598583	\N	\N	90	90	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
965	Світлана Приймак	pryimak.svitlana@lnu.edu.ua	$2a$06$hlUwFtKvxuQ3nNZ0DrayseEovOTzTxgyOB3/fou9jLo0Hemlna27i	teacher	2025-11-05 13:20:07.598583	\N	\N	91	91	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
966	Ярослав Ярема	yarema.yaroslav@lnu.edu.ua	$2a$06$JC2gG4yrxFT1ytddy0CDI.apQzTT5YZIveI49nIh1iCfnnreXMGnO	teacher	2025-11-05 13:20:07.598583	\N	\N	91	91	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
967	Наталія Лобода	loboda.nataliia@lnu.edu.ua	$2a$06$eL8/R0jjfWuH82UyJHw9.uadoCf3M3gsseDEfg6X.XlHc5iZxnWyi	teacher	2025-11-05 13:20:07.598583	\N	\N	91	91	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
968	Анна Шот	shot.anna@lnu.edu.ua	$2a$06$1I3YdqumR3iC7o/yVQXxceMzx5WzzR33xxCRTbdR6dUvti3DNhfRW	teacher	2025-11-05 13:20:07.598583	\N	\N	91	91	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
969	Олена Сідельник	sidelnyk.olena@lnu.edu.ua	$2a$06$qYrRblr1Y8pqf373nez4QeOT1HNUNxAFdbGJ8slZxXPRwZaLoIQYC	teacher	2025-11-05 13:20:07.598583	\N	\N	93	93	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
970	Богдан Пшик	pshyk.bohdan@lnu.edu.ua	$2a$06$o8QVwcURJ.H.A0mPl9vOR.MAhSyZk7wyyJnTNCFKNn40N08N4I.1S	teacher	2025-11-05 13:20:07.598583	\N	\N	93	93	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
971	Уляна Грудзевич	hrudzevych.uliana@lnu.edu.ua	$2a$06$bO3q9I8VaUr5w3yqUWrgc.lX8ovkNPyRD8CUg3BrSoDXZzhKSw/DK	teacher	2025-11-05 13:20:07.598583	\N	\N	93	93	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
972	Наталія Ситник	sytnyk.nataliia@lnu.edu.ua	$2a$06$CEw7XhmcL9v3d6xqwFpJPOyoTT1sj8WTO/KPcngU8Bc2jh4ScweqO	teacher	2025-11-05 13:20:07.598583	\N	\N	94	94	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
973	Уляна Ватаманюк-Зелінська	vatamaniuk-zelinska.uliana@lnu.edu.ua	$2a$06$3fEEU7BARzd6GIRynaneMejSqzI7zSWQSDEqBMFOK/B7fm9yEMSEO	teacher	2025-11-05 13:20:07.598583	\N	\N	94	94	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
974	Юлія Шушкова	shushkova.yuliia@lnu.edu.ua	$2a$06$wtnX9sqgRPXeSjHwksWKT.1QlocKwZwzDmpLXkwFbGa/cQxI7TZi6	teacher	2025-11-05 13:20:07.598583	\N	\N	94	94	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
975	Ярослав Гринчишин	hrynchyshyn.yaroslav@lnu.edu.ua	$2a$06$vCV8LUf3xfdXWhGicj5b9ejUDuOUlAeFDtNMn3m4yIMPWyx9e9umW	teacher	2025-11-05 13:20:07.598583	\N	\N	94	94	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
976	Надія Завальницька	zavalnytska.nadiia@lnu.edu.ua	$2a$06$h2h.EoOff6sVdLHLHHSEE.lAVrnMsRjl5fjPWjq1j59D92kKQg72y	teacher	2025-11-05 13:20:07.598583	\N	\N	94	94	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
977	Оксана Західна	zakhidna.oksana@lnu.edu.ua	$2a$06$Y2ddvWvGmPR5d0lrx4/lxumRwRISngqj7wPtG2CRRA6Fk.wfXOwq.	teacher	2025-11-05 13:20:07.598583	\N	\N	94	94	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
978	Віра Круглякова	kruhliakova.vira@lnu.edu.ua	$2a$06$6tsiXNlzsDTS4CnboFiLG.46pAVIFdAbGM.VfI8tr2047wGNj4IvW	teacher	2025-11-05 13:20:07.598583	\N	\N	94	94	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
979	Ірина Шевчук	shevchuk.iryna@lnu.edu.ua	$2a$06$tgifkiyh.Fpv1VF7d8S3LO0YNBkAoGv8JvcL25nWgC8ikmL80WS8S	teacher	2025-11-05 13:20:07.598583	\N	\N	95	95	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
980	Ірина Борщук	borshchuk.iryna@lnu.edu.ua	$2a$06$bgjQY0.5gGtJMqRyCnZ2veATbWb6ohxnP.Z2BYxrL4D4PAOZi7XwO	teacher	2025-11-05 13:20:07.598583	\N	\N	95	95	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
981	Богдан Депутат	deputat.bohdan@lnu.edu.ua	$2a$06$2FfZpFUMJwUOtzzdCc6KQOlpIwpGEwVvtVlcJ3S6pcJWT767feFhS	teacher	2025-11-05 13:20:07.598583	\N	\N	95	95	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
982	Орест Мищишин	myshchyshyn.orest@lnu.edu.ua	$2a$06$ZDXOwiXS.bgKubn6x8dEIup24m4e658Nz9M93L.hIy7IMV0HieMjG	teacher	2025-11-05 13:20:07.598583	\N	\N	95	95	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
983	Олег Ярема	yarema.oleh@lnu.edu.ua	$2a$06$3Nciu1ODxBYWIz2PBZ1y3OV7TlGPZV3AWDntiizTgm7UpPZ3tVu4G	teacher	2025-11-05 13:20:07.598583	\N	\N	95	95	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
984	Богдан Мелех	melekh.bohdan@lnu.edu.ua	$2a$06$PbWT1gL9Thc6IunXGGM.eORv6IweKSlYLV5uSQQBwTISKUBML/ryO	teacher	2025-11-05 13:20:07.598583	\N	\N	96	96	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
985	Богдан Новосядлий	novosiadlyi.bohdan@lnu.edu.ua	$2a$06$OpS9IsU0F1QCM9DCobTFYe9y542wr/JJJC3.EQa4KxJMkKGMa0qkm	teacher	2025-11-05 13:20:07.598583	\N	\N	96	96	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
986	Наталія Гаврилова	havrylova.nataliia@lnu.edu.ua	$2a$06$6eUespy0gHIxBbtC/z.UrO7bUNw7hJZWC2sfqrALZKt8vx3bZM5A6	teacher	2025-11-05 13:20:07.598583	\N	\N	96	96	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
987	Юрій Кулініч	kulinich.yurii@lnu.edu.ua	$2a$06$U264wO1pJUXc..AQICaW0.MhaMqv66OppKQQIBuIi4CCgENYpGs1m	teacher	2025-11-05 13:20:07.598583	\N	\N	96	96	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
988	Оксана Стельмах	stelmakh.oksana@lnu.edu.ua	$2a$06$gHpOh3KoPugnJ6D.ko02aeUTlTtGnQ3odvon.x3PCi7DkMYmB/YfG	teacher	2025-11-05 13:20:07.598583	\N	\N	96	96	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
989	Анатолій Волошиновський	voloshynovskyi.anatolii@lnu.edu.ua	$2a$06$Dqyq.p2Lok4t4.bl3dcx8eTFpVZDsMpsFwlij98CX573sFYO1SHF6	teacher	2025-11-05 13:20:07.598583	\N	\N	97	97	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
990	Роман Гамерник	hamernyk.roman@lnu.edu.ua	$2a$06$154dsp7YWFNOF6xTU2bWxuk9uquDUCOnHEyKtrFfLgUyKQIQetCRW	teacher	2025-11-05 13:20:07.598583	\N	\N	97	97	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
991	Тарас Малий	malyi.taras@lnu.edu.ua	$2a$06$nwkISWWgWnrl.Da7A.6mFOkgaRQsncjBc/CnnSKbVPvlNSodztMOK	teacher	2025-11-05 13:20:07.598583	\N	\N	97	97	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
992	Андрій Пушак	pushak.andrii@lnu.edu.ua	$2a$06$tTcezB.HQkHmNwFMIbXABe93hWNVlOJGYUiGDW5FPP/ck79c8uuOG	teacher	2025-11-05 13:24:43.001802	\N	\N	97	97	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
993	Тарас Демків	demkiv.taras@lnu.edu.ua	$2a$06$tPnjlatuiZb0Cqc/ZFc7zOxv8DvN0q4DjMly9izQvD/K9P08D6N52	teacher	2025-11-05 13:24:43.001802	\N	\N	98	98	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
994	Назар Фтомін	ftomin.nazar@lnu.edu.ua	$2a$06$0JgPZXEeqeCFRq01ZGE8u.bd2JMW0ICUN4IRpvJ07.0piDlZ7S82i	teacher	2025-11-05 13:24:43.001802	\N	\N	98	98	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
995	Ярослав Чорнодолський	chornodolskyi.yaroslav@lnu.edu.ua	$2a$06$2u3Ip.wKqaChv8byPDl6WOAydGiFg2O8kW2bNIpxAStIory6TqIQC	teacher	2025-11-05 13:24:43.001802	\N	\N	98	98	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
996	Юрій Плевачук	plevachuk.yurii@lnu.edu.ua	$2a$06$Gln1lJ6jWcvImnFBWGW63u697p7PqbcPhxCfnMnsvFEfYyl14rsJy	teacher	2025-11-05 13:24:43.001802	\N	\N	99	99	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
997	Іван Щерба	shcherba.ivan@lnu.edu.ua	$2a$06$8Y3ZJsC6SwB6WE9ohKFeyuNN9PiWlEU79ayHU52sTfXcdrRm2rvkG	teacher	2025-11-05 13:24:43.001802	\N	\N	99	99	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
998	Петро Якібчук	yakibchuk.petro@lnu.edu.ua	$2a$06$qDdHlE4P2Dosin5KT10dAu5RyAKvBfuzRfFtxx38mH7epC8ggtDC.	teacher	2025-11-05 13:24:43.001802	\N	\N	99	99	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
999	Соломія Бук	buk.solomiia@lnu.edu.ua	$2a$06$gaFDOxt/L6sAEyQO3qH7aOuZBCITOCASyB8Xqt7vQfHpLm0A9M3R6	teacher	2025-11-05 13:24:43.001802	\N	\N	100	100	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1000	Галина Мацюк	matsiuk.halyna@lnu.edu.ua	$2a$06$FzzFdJWkJIxzBtJcwegUWOIfzq3zMprN8BV7bRpoEcBU0xyv.7L5W	teacher	2025-11-05 13:24:43.001802	\N	\N	100	100	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1001	Лариса Гонтарук	hontaruk.larysa@lnu.edu.ua	$2a$06$vwLQv3cnBXERcMOiTX8MIe/DiGfSR2.NhnnGrN.7DX6Tx4A8x3P..	teacher	2025-11-05 13:24:43.001802	\N	\N	100	100	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1002	Оксана Лозинська	lozinska.oksana@lnu.edu.ua	$2a$06$xXJZcEsLjfZGqHT7g.yDCerzd5jLCCP4fyihFgP/km5ePCM4VV2ny	teacher	2025-11-05 13:24:43.001802	\N	\N	101	101	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1003	Алла Кравчук	kravchuk.alla@lnu.edu.ua	$2a$06$NZNdq5GWjkdrmDdE1J09vuiKulveYx0yHK076n9f5.jPJcNdQTTnu	teacher	2025-11-05 13:24:43.001802	\N	\N	101	101	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1004	Уляна Євчук	yevchuk.uliana@lnu.edu.ua	$2a$06$98u6.2/8l3xYXiw9yay4cuSJaZAIe/WSnYzpct5rCNFawmRphbyLq	teacher	2025-11-05 13:24:43.001802	\N	\N	101	101	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1005	Уляна Левко	levko.uliana@lnu.edu.ua	$2a$06$6/Tl5llr6RpHc7/SPRhsQO109ikKYSLhMr4HV3SxpWdvqjv3gEOu.	teacher	2025-11-05 13:24:43.001802	\N	\N	101	101	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1006	Христина Ніколайчук	nikolaichuk.khrystyna@lnu.edu.ua	$2a$06$5ajjqPhncJULlUDhNjb/w.H/PimQSdBmpeiFz5QBZET5fr5YcP0au	teacher	2025-11-05 13:24:43.001802	\N	\N	101	101	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1007	Юлія Стефанишин	stefanyshyn.yuliia@lnu.edu.ua	$2a$06$zq4gbFnRdTkkOjW0lrSgI.G6PFeEQJddZREmnqdtQoOrpFFm021mu	teacher	2025-11-05 13:24:43.001802	\N	\N	101	101	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1008	Людмила Васильєва	vasylieva.liudmyla@lnu.edu.ua	$2a$06$fXLl0Pe5ovMbJSpf.FGQ2emvAr5RS4vQ09OzKRhflP9HFeEs2L55K	teacher	2025-11-05 13:24:43.001802	\N	\N	102	102	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1009	Алла Татаренко	tatarenko.alla@lnu.edu.ua	$2a$06$hFsuyG8y/eiHQxh3H3fk2OVGZsVfXWx3XgFVGaKxwWVKaZtyb4wvO	teacher	2025-11-05 13:24:43.001802	\N	\N	102	102	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1010	Галина Бушко	bushko.halyna@lnu.edu.ua	$2a$06$Ka4HxjYPT78r6Y4eNf6g9efPqBVUrR476.haKlH5X.jATefqmZ.eG	teacher	2025-11-05 13:24:43.001802	\N	\N	102	102	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1011	Марія Василишин	vasylyshyn.mariia@lnu.edu.ua	$2a$06$8jatSgGnuAAVvZg8cRIV0OhrocG6myjXi/sG0nJK1FXDHns0ZzQE.	teacher	2025-11-05 13:24:43.001802	\N	\N	102	102	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1012	Зоряна Гук	huk.zoriana@lnu.edu.ua	$2a$06$HMOdzOOT.Ffta7KaS.GIS.6hFJCo4q5OAhNxg1JFdSPT2QNrEQ/Iy	teacher	2025-11-05 13:24:43.001802	\N	\N	102	102	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1013	Ольга Кравець	kravets.olha@lnu.edu.ua	$2a$06$NjQfWNqfjRXCkWZIp5EFqOZnoZzwLEanTL/M5c2CuCJ6owdfPC0CK	teacher	2025-11-05 13:24:43.001802	\N	\N	102	102	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1014	Надія Лобур	lobur.nadiia@lnu.edu.ua	$2a$06$FEDOL8/hw65vCuA8bOcCg.vUwgOkP42VDrdZfr.gfQPIKJ17rw2pG	teacher	2025-11-05 13:24:43.001802	\N	\N	102	102	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1015	Любов Осташ	ostash.liubov@lnu.edu.ua	$2a$06$7gGvNnPcUnKi.oIHtNH1c.7Y30bdrnARM88nCxEYaIyBHBooZZ0.m	teacher	2025-11-05 13:24:43.001802	\N	\N	102	102	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1016	Ольга Максимів	maksymiv.olha@lnu.edu.ua	$2a$06$Pw6bMUuk3iU8aCVFY7Fu8.X2XiVRF0IL50mo0YnBOWBHDC2O/s8e.	teacher	2025-11-05 13:24:43.001802	\N	\N	103	103	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1017	Надія Ігнатів	ihnativ.nadiia@lnu.edu.ua	$2a$06$Zaenia7zJ7zrDuoC1gr7KuXfHdPxtkxy3GHzac3ME62eWcxZ2cMGW	teacher	2025-11-05 13:24:43.001802	\N	\N	103	103	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1018	Ірина Ілійчук	iliichuk.iryna@lnu.edu.ua	$2a$06$VyLvCks588V5DEwki4Jg0ebhJaDNUyEDRY.//0yk6yMpXpRNsJ.Ja	teacher	2025-11-05 13:24:43.001802	\N	\N	103	103	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1019	Марта Стельмах	stelmakh.marta@lnu.edu.ua	$2a$06$W9aJ9QNUOB7oq5Vgaax8Y.QYzVK04dTbPZjx0rfvpbNHMqyzM/r3i	teacher	2025-11-05 13:24:43.001802	\N	\N	103	103	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1020	Володимир Микитюк	mykytyuk.volodymyr@lnu.edu.ua	$2a$06$y5XgWK2n1AUlT7sFuz2ZYu5eovIZUb.KY9VeJIXbdnGIbD5fQyytm	teacher	2025-11-05 13:24:43.001802	\N	\N	104	104	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1021	Богдана Кріса	krisa.bohdana@lnu.edu.ua	$2a$06$f5oI3ZLpXlwExGO7kV8XQu0XQIyE0Em423gvkeAT/sVGjORDHr412	teacher	2025-11-05 13:24:43.001802	\N	\N	104	104	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1022	Ірина Роздольська	rozdolska.iryna@lnu.edu.ua	$2a$06$b4.l3UkH6di1MfAGkRsGNut9HEuyWW5pKt3h074cG.JNBMCtq7KV6	teacher	2025-11-05 13:24:43.001802	\N	\N	104	104	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1023	Лілія Бомко	bomko.liliia@lnu.edu.ua	$2a$06$GPXCPO2fz9mx.kliGpgbquSlIYnpTzbyXKCoDI0oY5Ilmv/T2ovRm	teacher	2025-11-05 13:24:43.001802	\N	\N	104	104	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1024	Юрій Горблянський	horblianskyi.yurii@lnu.edu.ua	$2a$06$rDW3OWowiAMJGjykiEgPn.tRe/ZHkd5PW3P367SLame6gu3eQSETW	teacher	2025-11-05 13:24:43.001802	\N	\N	104	104	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1025	Микола Крупач	krupach.mykola@lnu.edu.ua	$2a$06$z/bztq4K2Ve2rflJ2xwpQuoRrYsVYIu5V9mjkU79Obxg18wJqmHIm	teacher	2025-11-05 13:24:43.001802	\N	\N	104	104	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1026	Орися Легка	lehka.orysia@lnu.edu.ua	$2a$06$WaRatoBzpIf05/il.B1rUeBJZpe7TH6Nmy87v13dbc55HkH8j6ddm	teacher	2025-11-05 13:24:43.001802	\N	\N	104	104	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1027	Андрій Дахній	dakhnii.andrii@lnu.edu.ua	$2a$06$r4ZW6aI5QtvcwYDiAlp1r.tEEa9Th.yIyh3WpMGmi6aBr9nZQ77QO	teacher	2025-11-05 13:24:43.001802	\N	\N	105	105	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1028	Андрій Синиця	synytsia.andrii@lnu.edu.ua	$2a$06$6MWQNK248gzWHX.ZBkSIQuUn.5.PTvwbfSexRikGTbYhs9ch5WLuq	teacher	2025-11-05 13:24:43.001802	\N	\N	105	105	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1029	Анатолій Романюк	romaniuk.anatolii@lnu.edu.ua	$2a$06$qD6qLfEzBXPj3nEgeIM19e8VGkG1O67k0QJ7aRqgPKyiOcN7UKFz6	teacher	2025-11-05 13:24:43.001802	\N	\N	106	106	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1030	Світлана Була	bula.svitlana@lnu.edu.ua	$2a$06$XqYE3ElUWNOQ8fHK1fbWGOmODj2kPgnI46vIdQ3QO3VJmrKk/zdUi	teacher	2025-11-05 13:24:43.001802	\N	\N	106	106	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1031	Ірина Куречко	kurechko.iryna@lnu.edu.ua	$2a$06$8.7I3nKrSGIi5xFjb5KjMur/jMTaeeeTN9BGNt0JyI3yy4tFQsGnu	teacher	2025-11-05 13:24:43.001802	\N	\N	106	106	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1032	Андрій Панарін	panarin.andrii@lnu.edu.ua	$2a$06$jsfGAesoySeJW/05AMRh4.S3jcSqV8enMIK16cILtu0cBqVJAcvoK	teacher	2025-11-05 13:24:43.001802	\N	\N	106	106	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1033	Любомир Скочиляс	skochylias.liubomyr@lnu.edu.ua	$2a$06$GPCSokFbc0QUBoo7zRBLGe1B6b87lY4QOiaoJTdcGYfGmSK4mxvv.	teacher	2025-11-05 13:24:43.001802	\N	\N	106	106	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1034	Оксана Шурко	shurko.oksana@lnu.edu.ua	$2a$06$MP.vM4Zk/n3ofy3WMAgxDOB5.//MqPxXJI9s532qAH9AsCmb93Peu	teacher	2025-11-05 13:24:43.001802	\N	\N	106	106	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1035	Вадим Васютинський	vasiutynskyi.vadim@lnu.edu.ua	$2a$06$tlktFWHJ65jNSVe958BYauE7HZwZhKej2ij3ol26CRPw7rowAfiD.	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1036	Інна Галецька	haletska.inna@lnu.edu.ua	$2a$06$fH6PEFcJ2gWjwXHWfZURCOC.Pbl2GDijt3NoZ7gq3p9Ff6nAfk0Pm	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1037	Тетяна Партико	partyko.tetiana@lnu.edu.ua	$2a$06$.3eutyQx4h6.T.nlX.5S4uIwEXvC.iPbVs.qWqBCtoSqhpAkMFWQm	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1038	Олена Абрамюк	abramiuk.olena@lnu.edu.ua	$2a$06$0B.fd9Vkxx8.Nmi3NSd0beWRPbK1SkURLnXplLlYu5ta4/750cYde	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1039	Олена Волошок	voloshok.olena@lnu.edu.ua	$2a$06$K7sI0DhJxj.5QvYY0.TBsen671MouItODgoTZ0t9WBdfVMqmTyp/m	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1040	Наталія Гребінь	hrebin.nataliia@lnu.edu.ua	$2a$06$6EWJvMOHIsqNinuP.QFF0u5g5FlKGxqp47uf.BPrig3woHQ0.T2Wu	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1041	Лариса Дідковська	didkovska.larysa@lnu.edu.ua	$2a$06$lhBosPM/e4GllXAR2WDSE.Tdw1R4unCpI4DiocbiUt/YamNAQDHgS	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1042	Руслана Каркоська	karkoska.ruslana@lnu.edu.ua	$2a$06$cbWUDSYNrVc.Pf.3dtx17eN6TTAjGScoMcsgC7vpGywN7o3mfBF/i	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1043	Ольга Козаченко	kozachenko.olha@lnu.edu.ua	$2a$06$P2tbH/fmKHfXV7jA/KHWau76QcGhOjRu0fuvbYsx/Lt63nLo8xmTy	teacher	2025-11-05 13:24:43.001802	\N	\N	107	107	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1044	Марія Альчук	alchuk.mariia@lnu.edu.ua	$2a$06$JbWKKXIZR4l7VSiCZwsPDubOiNK1nTmpmmC/tWCePcdhHjGZCUHaK	teacher	2025-11-05 13:24:43.001802	\N	\N	108	108	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1045	Ігор Бойко	boiko.ihor@lnu.edu.ua	$2a$06$cDAktDAU5IgXImnBX6fP7.rK8sqF.KJPwVcGCO4JNx0EPjWsMyQjC	teacher	2025-11-05 13:24:43.001802	\N	\N	108	108	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1046	Тетяна Власевич	vlasevych.tetiana@lnu.edu.ua	$2a$06$t4tnBAj7FuA4aI85yk76KesqfWquWADDhjereCn7pDNSVEQOibIrK	teacher	2025-11-05 13:24:43.001802	\N	\N	108	108	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1047	Оксана Дарморіз	darmoriz.oksana@lnu.edu.ua	$2a$06$jin.y8u7Ft5bphvV2SMGiezoOrAGe7CpA.W6wJT4pv4HIZCDLbKTi	teacher	2025-11-05 13:24:43.001802	\N	\N	108	108	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1048	Марія Довгань	dovhan.mariia@lnu.edu.ua	$2a$06$arg8KwD7B54yhb7FrcamVuMNqvbbW5cqk/hggOZ5dybu2v8s4owgS	teacher	2025-11-05 13:24:43.001802	\N	\N	108	108	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1049	Наталя Король	korol.nataliia@lnu.edu.ua	$2a$06$hTIxgoAopXM7U19xQD4pcOM9q8mGZzrV24wsihIaPLPJXs/BUoo0.	teacher	2025-11-05 13:24:43.001802	\N	\N	108	108	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1050	Лариса Мандрищук	mandryshchuk.larysa@lnu.edu.ua	$2a$06$TNuVLtLB.6MznGnkNp1cPuHmnpG0jt2muvtwzCDgXXVn7LFkxoFii	teacher	2025-11-05 13:24:43.001802	\N	\N	108	108	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1051	Ігор Пасічник	pasichnyk.ihor@lnu.edu.ua	$2a$06$UuGXTz67NZDfL2QhAqB1QOmNwQb4L7/T8qxyPfqSXlYlumr67EXqS	teacher	2025-11-05 13:24:43.001802	\N	\N	108	108	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1052	Людмила Рижак	ryzhak.liudmyla@lnu.edu.ua	$2a$06$gy3iIiFLMgOuihefUwIygO4bj3ezk9CgPbNqeMcC0G2kkxLspg9P6	teacher	2025-11-05 13:24:43.001802	\N	\N	110	110	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1053	Лідія Сафонік	safonik.lidiia@lnu.edu.ua	$2a$06$cz8TjUnIkXPcdpiF9qA2DOEZikCeNfhmYlXMLTUQKwx.CQaAwLVQy	teacher	2025-11-05 13:24:43.001802	\N	\N	110	110	\N	\N	f	\N	2025-11-05 13:24:43.001802	\N	\N	\N	\N
1297	Ірина Добропас	dobropas.iryna@lnu.edu.ua	$2a$06$332ut4h0IAW6RFNtuUw.sugTZ3wFUJA/379WAMp4Mugfx62InYumO	teacher	2025-11-05 13:29:08.817137	\N	\N	110	110	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1298	Євген Ланюк	laniuk.yevhen@lnu.edu.ua	$2a$06$0ikVTFaYv5y4rXCshDfFDOdm8PIxyRn76sHj4BdQ7wtSifCzwjcaG	teacher	2025-11-05 13:29:08.817137	\N	\N	110	110	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1299	Андрій Наконечний	nakonechnyi.andrii@lnu.edu.ua	$2a$06$kupQNPAxo7Ob1URGSD9fouhRRHR/t5SsDPM4uYCkV5fPB1zTas9om	teacher	2025-11-05 13:29:08.817137	\N	\N	110	110	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1300	Борис Поляруш	poliarush.borys@lnu.edu.ua	$2a$06$JU6kwEDr.9PgkDh9PoPHO.P6noeg7CmjbYXmOYGg7/GI.9EqQzIAm	teacher	2025-11-05 13:29:08.817137	\N	\N	110	110	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1301	Лілія Дубенська	dubenska.liliia@lnu.edu.ua	$2a$06$DsFb9dMg7TH6ltPLMYVXuuAJga9sBX8fhHTNyX7VJ/rs.sBADt9BW	teacher	2025-11-05 13:29:08.817137	\N	\N	111	111	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1302	Ольга Жак	zhak.olha@lnu.edu.ua	$2a$06$W/.YoiEcSFCZQlt2P6eb9ucBefgiGizhAf7YYke4TpIsQJdZBIHna	teacher	2025-11-05 13:29:08.817137	\N	\N	111	111	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1303	Ярослава Ломницька	lomnytska.yaroslava@lnu.edu.ua	$2a$06$IL5p4JixdzD7fBEChr4emOQGPWwzlNue6lE7Axs3zLjRojwIcO6o6	teacher	2025-11-05 13:29:08.817137	\N	\N	111	111	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1304	Ігор Пацай	patsai.ihor@lnu.edu.ua	$2a$06$6V6L4IuNcrWm4t2lxdNDmObMCJo0qwl4d49llnaABKZI1up4idYvG	teacher	2025-11-05 13:29:08.817137	\N	\N	111	111	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1305	Богдан Стельмахович	stelmakhovych.bohdan@lnu.edu.ua	$2a$06$cfGLr3aUIPagVSqPDXGVUOEHS8JU6wNsA386vLYzzYWIbSitVtIRC	teacher	2025-11-05 13:29:08.817137	\N	\N	111	111	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1306	Микола Обушак	obushak.mykola@lnu.edu.ua	$2a$06$f3REEeDOVN23OV1a3gPm6ui5.Vzq527B7U0hwOU3hBLuooMaEfzH6	teacher	2025-11-05 13:29:08.817137	\N	\N	112	112	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1307	Володимир Карп'як	karpiak.volodymyr@lnu.edu.ua	$2a$06$xJQlgxD9.Q84xHO201L/3.SzmiH9BBY0Tfavi2SrEEUyxVwOrJcwC	teacher	2025-11-05 13:29:08.817137	\N	\N	112	112	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1308	Юрій Остап'юк	ostapiuk.yurii@lnu.edu.ua	$2a$06$1xIQF/SIvG4NzPrcS6eo6uhR0SmvASkzRSA2MHCGPfg7B8KYI32Qi	teacher	2025-11-05 13:29:08.817137	\N	\N	112	112	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1309	Назарій Походило	pokhodylo.nazarii@lnu.edu.ua	$2a$06$eqny94BNEKKO3lBeFw3/Oe5.Gm5srMC/F2GdsAZvwe9wpYWYd4VVa	teacher	2025-11-05 13:29:08.817137	\N	\N	112	112	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1310	Роман Гладишевський	hladyshevskyi.roman@lnu.edu.ua	$2a$06$ALJ4CXFDsNbtjz.WhV1PZuZsA2uzS7eMFIz7LZbKA7F4huQckrd7i	teacher	2025-11-05 13:29:08.817137	\N	\N	113	113	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1311	Богдан Котур	kotur.bohdan@lnu.edu.ua	$2a$06$ceLgfRUIcKA6HfnhG0a7/.hljIYxbqpvkLD8MpauxgIGHR1jb.u0.	teacher	2025-11-05 13:29:08.817137	\N	\N	113	113	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1312	Володимир Павлюк	pavliuk.volodymyr@lnu.edu.ua	$2a$06$MhtK3zXNu8Q.L6yN9PlnjeKc2fnC6E2qOUWNXXJAVRTQIUSWa9/0u	teacher	2025-11-05 13:29:08.817137	\N	\N	113	113	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1313	Василь Заремба	zaremba.vasyl@lnu.edu.ua	$2a$06$5uijPiSde4RucD.hTgzcLO3nPvij3Ys0q40aqmd9nrT3IdlIKCkVa	teacher	2025-11-05 13:29:08.817137	\N	\N	113	113	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1314	Оксана Зелінська	zelinska.oksana@lnu.edu.ua	$2a$06$sKTU7FfrGW.mz3xLj2X9jeCWnG7xo4XhtD7HPwClS9w3pH0udy5uK	teacher	2025-11-05 13:29:08.817137	\N	\N	113	113	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1315	Наталія Муць	muts.nataliia@lnu.edu.ua	$2a$06$vjcyFoU3CKty90XhF61RTOIResv/jYWnKXv9wsC7sJoQRCeqSCMV2	teacher	2025-11-05 13:29:08.817137	\N	\N	113	113	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1316	Олексій Павлюк	pavliuk.oleksii@lnu.edu.ua	$2a$06$OSzBoF/XkK0AdXZ.MvD3hONNfljHsPJWmMi8vCmCPj001NYCmccBG	teacher	2025-11-05 13:29:08.817137	\N	\N	113	113	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1317	Зіновія Шпирка	shpyrka.zinoviia@lnu.edu.ua	$2a$06$8X4zKSVn6v.yW/Kg3lBXJuzQK4IpZDDnYpVevdjKNcRd.7Fy.y5i.	teacher	2025-11-05 13:29:08.817137	\N	\N	113	113	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1318	Володимир Решота	reshota.volodymyr@lnu.edu.ua	$2a$06$HCV/3I2yfTDdAysmy5Nh8O6pb6mUlv1j8WnibaRotD.5Du4za0SsS	teacher	2025-11-05 13:29:08.817137	\N	\N	114	114	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1319	Роман Джох	dzhoch.roman@lnu.edu.ua	$2a$06$K2iOqmGprrJyKWKYVUX0fea7v79I4LpmBwdbf6P2G/1RMs3f8XGem	teacher	2025-11-05 13:29:08.817137	\N	\N	114	114	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1320	Олег Ільницький	ilnytskyi.oleh@lnu.edu.ua	$2a$06$ujpNFJaJoc859mK412i9heuk.gMBUAUvlRBbHLWfUnt/QBvkoPk3u	teacher	2025-11-05 13:29:08.817137	\N	\N	114	114	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1321	Наталія Паславська	paslavska.nataliia@lnu.edu.ua	$2a$06$CR9ta/0d89ojyqkUdLNpjeZGr07Rd9ne7qMD4rbR9iZyxC8TpVGq.	teacher	2025-11-05 13:29:08.817137	\N	\N	114	114	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1322	Мар'яна Сирко	syrko.mariana@lnu.edu.ua	$2a$06$KtcjKFj66AiZwNY2uY0LSOxaQpgSwMMYTMP8uUSZK9PHnlQWfnZ26	teacher	2025-11-05 13:29:08.817137	\N	\N	114	114	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1323	Наталія Хлібороб	khliborob.nataliia@lnu.edu.ua	$2a$06$RkL8A9y9nzE4nr8JDLoR3eXyPUc1RwZ7gFnkCtvdPheqmd7E2atYK	teacher	2025-11-05 13:29:08.817137	\N	\N	114	114	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1324	Наталія Янюк	ianiuk.nataliia@lnu.edu.ua	$2a$06$bBkKlepd4zBSzXKa6Ma/K.TnLV9FUPdUwswAzJ5LlAio1c/CB2xTm	teacher	2025-11-05 13:29:08.817137	\N	\N	114	114	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1325	Олена Бориславська	boryslavska.olena@lnu.edu.ua	$2a$06$ZyFF3UNFRTPV4eNu8mtVguKmW1MbjqfxW/Rti0bDB5G99YpgAmfmu	teacher	2025-11-05 13:29:08.817137	\N	\N	115	115	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1326	Сергій Різник	riznyk.serhii@lnu.edu.ua	$2a$06$qt4/Po.6B07BJuPAssBe1OI5zExrdkKbDqYLXoF2c4R3HGePunjAa	teacher	2025-11-05 13:29:08.817137	\N	\N	115	115	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1327	Руслан Бедрій	bedrii.ruslan@lnu.edu.ua	$2a$06$kPpx3GlL5DgV7jAOfxgjdeODr1ni/T2FTwdGDJygQ3OYe0YUneULS	teacher	2025-11-05 13:29:08.817137	\N	\N	115	115	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1328	Вікторія Дубас	dubas.viktoriia@lnu.edu.ua	$2a$06$doKDBAct0IyuO0qaHmuoY.Bjcu44O/qx2C034QcEyoEtBqTzS84eu	teacher	2025-11-05 13:29:08.817137	\N	\N	115	115	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1329	Володимир Кобрин	kobryn.volodymyr@lnu.edu.ua	$2a$06$Ftnfiu4GWB19oxPt4YggrOWKgkInnxe.42ckwy5hDW7kEUUFK/XWa	teacher	2025-11-05 13:29:08.817137	\N	\N	115	115	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1330	Марта Мочульська	mochulska.marta@lnu.edu.ua	$2a$06$dmX/HTMo4Jx6TwlGbt7rwO45tdmhF0VZxAJbv6Nz/GJMHGCuFzdQW	teacher	2025-11-05 13:29:08.817137	\N	\N	115	115	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1331	Віталій Чорненький	chornenkyi.vitalii@lnu.edu.ua	$2a$06$eFsm2dYNXeZ6/K6ICreu/e2ubagzrb9oPvYGThTEaUU7kUhlab1JS	teacher	2025-11-05 13:29:08.817137	\N	\N	115	115	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1332	Іван Когутіч	kohutych.ivan@lnu.edu.ua	$2a$06$8790C20g3KXTJmunl2Xm7ekUgfVHK/Ihs6xSO0T0UzFXO4DBk0L9y	teacher	2025-11-05 13:29:08.817137	\N	\N	116	116	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1333	Василь Нор	nor.vasyl@lnu.edu.ua	$2a$06$6ncNkBwQH98hLBVagnR0BeA0bodEHyDCqJxyWHgNz/mi7Ij5eJUaq	teacher	2025-11-05 13:29:08.817137	\N	\N	116	116	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1334	Ярослав Береський	bereskyi.yaroslav@lnu.edu.ua	$2a$06$crsymCdOtT0RJrIwRBEt5.NCmpmR8zZI24.DFMr4HhXDdz6NeApGm	teacher	2025-11-05 13:29:08.817137	\N	\N	116	116	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1335	Галина Борейко	boreiko.halyna@lnu.edu.ua	$2a$06$iwm8dUyYOfZfTchakidOLuDlqeNT.mtTPeUUQvqh6XpTLdIPhmDeO	teacher	2025-11-05 13:29:08.817137	\N	\N	116	116	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1336	Альона Войнарович	voinarovych.alona@lnu.edu.ua	$2a$06$jfyvuI5U5IwBXkJABp2sb.KpDU6CztxBP/RAF9O5B.0eYCiSxc2uq	teacher	2025-11-05 13:29:08.817137	\N	\N	116	116	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1337	Марта Мазур	mazur.marta@lnu.edu.ua	$2a$06$hELXJ2Ui7NFTuu22yekO7eLzXboozAadkWKjNPD2jUlH2eTXteY/u	teacher	2025-11-05 13:29:08.817137	\N	\N	116	116	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1338	Валентин Мурадов	muradov.valentyn@lnu.edu.ua	$2a$06$PdDI17VUEV9PA0IE8RnJ1.PfFaA95Vcrhq63YeK9mP40QJ7sfYxuC	teacher	2025-11-05 13:29:08.817137	\N	\N	116	116	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1339	Андрій Павлишин	pavlyshyn.andrii@lnu.edu.ua	$2a$06$QstspumYnsU/tUl3N8a9.ONaSP3YU7SMnpeQlkRljT8U6nPpMAsZG	teacher	2025-11-05 13:29:08.817137	\N	\N	116	116	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1340	Пилип Пилипенко	pylypenko.pylyp@lnu.edu.ua	$2a$06$Ujh3CEwSVBmZbDfjhgU39uCzIWJ9B.UUCPPHv1I26/x8F1jfuYzba	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1341	Марія Ващишин	vashchyshyn.mariia@lnu.edu.ua	$2a$06$hwi9YcwjeSN7NxkzLIZhN.9lqf/ompeWvR3X0RO.Yk7FOjywpE00q	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1342	Світлана Синчук	synchuk.svitlana@lnu.edu.ua	$2a$06$DQ1qTQtJsMLnBpFcEbPyP.gqpYSjAvhuA.jZYsxuyJcU5FUjlC4By	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1343	Оксана Гірник	hirnyk.oksana@lnu.edu.ua	$2a$06$GVr.29DSKUVYB.pGKdHF7.4aFwfOJJfvhwPnZgMtLHGhBJOIn9/aq	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1344	Олена Кульчицька	kulchytska.olena@lnu.edu.ua	$2a$06$4ATNpMoZJDCYyMioGioBGua.hVfa6zOoEzxTH4Zo4/KPeYhW2fYb2	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1345	Надія Левицька	levytska.nadiia@lnu.edu.ua	$2a$06$GUIiSa7K1BqGCZlHB59f.ud7nuvvkA4afkgJdZN9jhtp44srxmnLe	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1346	Ігор Олексів	oleksiv.ihor@lnu.edu.ua	$2a$06$au7KoAMhgLdbzCWy5WIPe.n.ubfvVU.BBTh4uTtBRYI0cyQqv0UMy	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1347	Тетяна Парпан	parpan.tetiana@lnu.edu.ua	$2a$06$pEDtYtBai304sl7u6GQ2TuIg5QCdPHYH3jY67m0HP3gs/3QStOpXe	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1348	Оксана Стасів	stasiv.oksana@lnu.edu.ua	$2a$06$HoGNb0lWuC2f46COI1ZtluOboLiEcLG.2zHYe7EC2KKwqZHt83F9m	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1349	Володимир Федорович	fedorovych.volodymyr@lnu.edu.ua	$2a$06$hA7slvqy0HGMbL/JNybWu.YxhIfKndMAoLLvXvFghmXJTc4zt2vuu	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1350	Христина Чопко	chopko.khrystyna@lnu.edu.ua	$2a$06$YaqFa9woov92zn9cNhjAJ.LNoRRTAVBslcUsMGnYu/hLe7B/rjjJe	teacher	2025-11-05 13:29:08.817137	\N	\N	117	117	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1351	Володимир Коссак	kossak.volodymyr@lnu.edu.ua	$2a$06$TDGwX39QtH60P4/pIlLDR.coxhoHFRZE6K681J59okIkaVUxC.hw.	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1352	Мирослава Дякович	diakovych.myroslava@lnu.edu.ua	$2a$06$qafGfcqICc2SbAXjpxp5kOQdRTwkDrksIjyfJTAap2tYTJPRlU1s.	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1353	Марія Михайлів	mykhailiv.mariia@lnu.edu.ua	$2a$06$qpZFKJfBMuU8Yie8TRt0pucJ99zncqRRwrpIlD5WdPekR6jOjELE6	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1354	Тарас Рим	rym.taras@lnu.edu.ua	$2a$06$KTT.D/Eju9eI2Wu6c/gQyOw9Ze3xjf7yq1fnEeQFpG19HG.2WPCfK	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1355	Володимир Цікало	tsikalo.volodymyr@lnu.edu.ua	$2a$06$H6LPVD85CbG7D8Tyu5Ed/eT/V1fokDUihwPXuoL6VfRmJAoP09K2a	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1356	Ігор Якубівський	iakubivskyi.ihor@lnu.edu.ua	$2a$06$uGkWTQVB82TFrUbWtyyIEeL9otV0oy4WDq30qitWlPOth9LuUt0AC	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1357	Галина Яновицька	ianovytska.halyna@lnu.edu.ua	$2a$06$nAUm6E3TzRE112GMPFr8duLr2wzbfmDpUtfuWXcpnZLMmKTtJDuk.	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1358	Юліан Бек	bek.yulian@lnu.edu.ua	$2a$06$6e4NoHWEfgzgu2AdsPhz9OBn4nBPyVsKcDuMAPKqXxfpfxqpDg4GK	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1359	Ірина Верес	veres.iryna@lnu.edu.ua	$2a$06$xnMa6jwp1LpsKZRVYJK9IOwGKvIlSdFMh7smJ3trgau87QheTO2W6	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1360	Наталія Грущинська	hrushchynska.nataliia@lnu.edu.ua	$2a$06$4SewSsdQttyzrCQZK/XJWuIEf.4cNoYilMsUQDgA1rYbt7sJP7JsG	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1361	Юрій-Антоній Зборівський	zborivskyi.yurii-antonii@lnu.edu.ua	$2a$06$XNPw/FUqRqI40cMYVsaMZuo3YohAwnxCn6Ne703OShrE6w6.RU2rq	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1362	Марта Кравчик	kravchyk.marta@lnu.edu.ua	$2a$06$aM.HX6AdCP0BvQ85/IOoDuQsX2leBHu3xsP5yZvaAQW9/pm8lnJDO	teacher	2025-11-05 13:29:08.817137	\N	\N	118	118	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1365	Іван Михасюк	mykhasuk.ivan@lnu.edu.ua	$2a$06$3AAjfTptWDARLz0gsEuUhu0sze92eDonMvmrq9QPFFDupR0qi370S	teacher	2025-11-05 13:29:08.817137	\N	\N	25	25	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1366	Марія Гарасимлюк	harasymliuk.mariia@lnu.edu.ua	$2a$06$SsvCvh2.rU/IFbRoiBxkSeC9Lgvf65./ARJ86UEIq7flsuO4gUv/i	teacher	2025-11-05 13:29:08.817137	\N	\N	25	25	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1367	Андрій Гукалюк	hukaliuk.andrii@lnu.edu.ua	$2a$06$g4D6amxXH4CABlTtmBfYsejdUp2zpx.Py8BgqxSe3/fAOECcAjPFy	teacher	2025-11-05 13:29:08.817137	\N	\N	25	25	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1368	Зіновія Залога	zaloha.zinoviia@lnu.edu.ua	$2a$06$kdeVqbtNRewlbQArbfJvsOHJm9KyekQ.VfmZR5S.VIMLzjPohrlWe	teacher	2025-11-05 13:29:08.817137	\N	\N	25	25	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1369	Мирослав Дацко	datsko.myroslav@lnu.edu.ua	$2a$06$Len2hGJym2XOHE0pT394Qu/bNrxfQOo/kSLEwwO106v6KxWHEUHnS	teacher	2025-11-05 13:29:08.817137	\N	\N	24	24	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1370	Ольга Гринькевич	hrynkevych.olha@lnu.edu.ua	$2a$06$Esoz3bZnHKcEthXolH1rO.6uHVQC3a.1LIR.HAx8Kvc45rX48kazC	teacher	2025-11-05 13:29:08.817137	\N	\N	30	30	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1371	Мар'яна Вдовин	vdovyn.mariana@lnu.edu.ua	$2a$06$H/AbXNKROOxEf4XdiKyMP.zmTI3EIkL3ZmnaMGo4gBu/dANyxWQy2	teacher	2025-11-05 13:29:08.817137	\N	\N	30	30	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1372	Оксана Вільчинська	vilchynska.oksana@lnu.edu.ua	$2a$06$rLwiYeFr/CTEVT1DK3c50eU.zZLrLzC9x9EynfrB0sGDvs3H3saAq	teacher	2025-11-05 13:29:08.817137	\N	\N	30	30	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1373	Марія Квасній	kvasnii.mariia@lnu.edu.ua	$2a$06$O0dFI075mN6G25gPT0A2g.z9mpiljZO4VROkSxRfIzqx.Hjei65CO	teacher	2025-11-05 13:29:08.817137	\N	\N	30	30	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1374	Тарас Панчишин	panchyshyn.taras@lnu.edu.ua	$2a$06$0tvL6kAYsVvzkFee.WsHr.q7u61VWAs3CjEIOaroOJ/nhO35kE6RK	teacher	2025-11-05 13:29:08.817137	\N	\N	30	30	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1375	Наталія Савка	savka.nataliia@lnu.edu.ua	$2a$06$Iug..JM0dbkVtbIJxjhZfuMs8TYMC.6TWPb765RU.SLUWt370Lfte	teacher	2025-11-05 13:29:08.817137	\N	\N	30	30	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1377	Іван Катеринчук	katerynchuk.ivan@lnu.edu.ua	$2a$06$q8xje9NxLlVhkrf7ZLiGJuAxfpM4aLfgX7oQDfHQlrVFweTRJtRiK	teacher	2025-11-05 13:29:08.817137	\N	\N	32	32	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1379	Володимир Франів	franiv.volodymyr@lnu.edu.ua	$2a$06$swynOtqqf9pxKy8e8QAo0uiZe.13RCU3ZDnzwtob7BJy7DS8oyM9e	teacher	2025-11-05 13:29:08.817137	\N	\N	32	32	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1380	Галина Клим	klym.halyna@lnu.edu.ua	$2a$06$71WriqYx1.W/rz2bUnzhc.BarJSYT0.fV48xW7c4YghOztM8fxzm6	teacher	2025-11-05 13:29:08.817137	\N	\N	33	33	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1381	Любомир Монастирський	monastyrskyi.liubomyr@lnu.edu.ua	$2a$06$Dd9jfHMbuYZhbx3eS68c6.T5jikmrU0VTsqW3ypoZ3wM/lfx52QKG	teacher	2025-11-05 13:29:08.817137	\N	\N	33	33	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1382	Ярослав Бойко	boiko.yaroslav@lnu.edu.ua	$2a$06$fswLfvVBO27px2VjAOohEuylyZ2cr1vsxjo2CtP1oDRWWFu9Y8YSO	teacher	2025-11-05 13:29:08.817137	\N	\N	33	33	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1386	Микола Посівнич	posivnych.mykola@lnu.edu.ua	$2a$06$TorsdbmtT2UxHu3VzTVBH.D4TCwdG3XpuYD6nYv.a7ZMbtqimVw7e	teacher	2025-11-05 13:29:08.817137	\N	\N	53	53	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1387	Світлана Салдан	saldan.svitlana@lnu.edu.ua	$2a$06$7cyhHp3Za4ajIV53gwwY1.Rjj6SWG1bFJVkbUYpapWA.MkszSy9N6	teacher	2025-11-05 13:29:08.817137	\N	\N	56	56	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1388	Олег Лихач	lykhach.oleh@lnu.edu.ua	$2a$06$.QUfnRthWRApVYnZOcvg/OhEfgOVFQ5BXJbgPqBUZDw8/eoUdYqyy	teacher	2025-11-05 13:29:08.817137	\N	\N	56	56	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1389	Зоряна Гнатів	hnativ.zoriana@lnu.edu.ua	$2a$06$zQC/2iF81DjuOxmwXPuvbegXtiKNr6FLXU/JPF5nSZD4T0jPghI6K	teacher	2025-11-05 13:29:08.817137	\N	\N	56	56	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1390	Богдан Кисляк	kysliak.bohdan@lnu.edu.ua	$2a$06$rTp1r8H2kC8QtV9dxlMJlue9Rt3X.oyKEDpcQKxI10ZsCpCSOgRZm	teacher	2025-11-05 13:29:08.817137	\N	\N	56	56	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1391	Андрій Водичев	vodychev.andrii@lnu.edu.ua	$2a$06$FgF7v9N9ztI6WXV0/m6xKeX2F3vNWufXwFl8HZPWXLIpc3dgy4/Ee	teacher	2025-11-05 13:29:08.817137	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1392	Олена Крилова	krylova.olena@lnu.edu.ua	$2a$06$eCDuRCeZ4mqV7m/aAq2HmOt5n.9U2OLVfEZAWL835DwwfSTMR8XFS	teacher	2025-11-05 13:29:08.817137	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1393	Інна Прокопчук	prokopchuk.inna@lnu.edu.ua	$2a$06$DKqvQiifZHhQiQpT6rAjmeQx2G1qsPAhiSFZ4LNbtQdRv4dh48qiu	teacher	2025-11-05 13:29:08.817137	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1394	Юрій Чеков	chekov.yurii@lnu.edu.ua	$2a$06$cQmKhwivt.pwIF1LSblCP.124k/DtmcGiYS29d1EW2m4i3gJU5AE6	teacher	2025-11-05 13:29:08.817137	\N	\N	59	59	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1395	Марія Косарчін	kosarchyn.mariia@lnu.edu.ua	$2a$06$HHb6/pDDLc4SrNw9YP8p9.ajl26P.8j8jzGeZi.3B7eg0Lq1ZvbQm	teacher	2025-11-05 13:29:08.817137	\N	\N	22	22	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
283	Анатолій Музичук	muzychuk.anatolii@lnu.edu.ua	$2a$06$HVtreDPDVGSCvfBxGH.WvuuPdeVgn4cpaEPhntNCbpPohkFsEGf8y	teacher	2025-11-05 12:59:28.40274	2025-11-17 01:12:17.938011	\N	13	85	\N	\N	f	2025-11-17 01:22:31.826255	2025-11-05 12:59:28.40274	\N	\N	\N	\N
570	Сергій Свелеба	sveleba.serhii@lnu.edu.ua	$2a$06$3JcdQ00x8Rip/5wgAJOV1.fwKtYD5UXcEvM3x8.nhvRii5U15N24W	teacher	2025-11-05 13:10:04.072109	2025-11-05 14:08:11.725694	2025-11-05 14:09:17.502767	5	32	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
1385	Олексій Кушнір	kushnir.oleksii@lnu.edu.ua	$2a$06$fVjkaxeXIE03.Jx6mZyQ1unX06Wa8e.ZYB7ZwQKvBbuVlCDHZgVGS	teacher	2025-11-05 13:29:08.817137	2025-11-13 22:49:53.724826	2025-11-13 22:50:16.735302	34	34	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
77	Олег Кушнір	kushnir.oleh@lnu.edu.ua	$2a$06$B1P7QZ7YVq6pH7G5Ia4V9ODfS6nkRxjiNPkvRDmjO053ns6eoT78S	teacher	2025-11-05 12:47:34.179085	2025-11-05 14:09:34.419954	2025-11-05 14:10:14.540454	5	32	\N	\N	f	\N	2025-11-05 12:47:34.179085	\N	\N	\N	\N
118	Роман Стахіра	stakhira.roman@lnu.edu.ua	$2a$06$1m4G5RLQ5.lf4ijTI6/obeubM4LFCc34u1MQOAF6Lu4zf0LiOJl2y	teacher	2025-11-05 12:50:24.062717	2025-11-13 12:47:52.497115	2025-11-13 00:01:39.336326	5	35	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
105	Михайло Русиняк	rusyniak.mykhailo@lnu.edu.ua	$2a$06$3s2FezWzxLp5ih9XUD1neOova6lzBXdDHP11ma8pwFXDQ29qG1K2q	teacher	2025-11-05 12:50:24.062717	2025-11-12 21:08:00.902089	2025-11-09 23:58:42.15451	5	32	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
1397	Оля Гаврилюк	gavriliuk.olha@lnu.edu.ua	$2a$06$3jnIVuZ0vCv50eZX9yQUXuRHu9KjsSTXyfEhaKnVtaamkTXyQ3ACq	student	2025-11-05 22:22:50.364795	2025-11-29 12:58:37.063336	2025-11-29 12:58:48.088698	5	35	\N	\N	f	\N	2025-11-05 22:22:50.364795	\N	\N	\N	\N
23	Вікторія Особа	viiktoria.osoba29@lnu.edu.ua	$2a$06$oy7BbUQNDxAHg2DP3DsC9OjkrxFhVt/RqU/1BgioPFwikX99pcTUm	student	2025-11-05 00:48:01.35612	2025-11-29 12:59:24.115562	2025-11-09 15:18:28.085632	5	35	\N	\N	f	2025-11-05 00:55:38.822598	2025-11-05 00:48:01.35612	\N	\N	\N	\N
116	Володимир Юзевич	yuzevych.volodymyr@lnu.edu.ua	$2a$06$joo0bG4cnPDbwme5RvLPyOHjwgMxCJHZkXZvhSXWVOhYckVAwdsi2	teacher	2025-11-05 12:50:24.062717	2025-12-07 17:01:03.541338	2025-11-13 13:28:57.513816	5	35	\N	\N	f	\N	2025-11-05 12:50:24.062717	\N	\N	\N	\N
1384	Ігор Катерняк	katerniak.ihor@lnu.edu.ua	$2a$06$Y.3wstSmPapcOtQmlCBrDeWyMaakVnWLl7BS1xsI/nraS4TeQNj.6	teacher	2025-11-05 13:29:08.817137	2025-12-14 21:04:55.280995	\N	34	34	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
1376	Ігор Половинко	polovynko.ihor@lnu.edu.ua	$2a$06$SkxEYZnjNpX08x15dLzb1emL4BwKYR8V5aHHtsroU5W2wTk2s8Umm	teacher	2025-11-05 13:29:08.817137	2025-12-28 13:35:50.387161	2025-12-07 02:06:02.07812	32	32	\N	\N	f	\N	2025-11-05 13:29:08.817137	\N	\N	\N	\N
235	Роман Калитчак	kalytchak.roman@lnu.edu.ua	$2a$06$WlSej5LN1yPtzNTGIe7zV.3K5ehpFipL89Bj4idQol0k4xamJY3vS	teacher	2025-11-05 12:57:42.152688	2025-11-09 00:11:36.900012	\N	11	74	\N	\N	f	\N	2025-11-05 12:57:42.152688	\N	\N	\N	\N
946	Іван Дияк	diiak.ivan@lnu.edu.ua	$2a$06$q0DW94wbcpO24bqzIr/om.SdjvBxu1INfrkb1hUXv6umQwZQogQOu	teacher	2025-11-05 13:20:07.598583	2025-11-18 17:15:14.58992	2025-11-18 17:12:50.261235	83	83	\N	\N	f	\N	2025-11-05 13:20:07.598583	\N	\N	\N	\N
1399	viktor alert	gmgmjgjfffj@lnu.edu.ua	$2a$06$7KvfLX3R.38dyD/EkFHEVuN..sd.Xz7i413WJdZtJkioc3kzXrkjC	student	2025-11-26 00:36:19.921679	2025-11-26 00:37:21.053908	2025-11-26 00:37:54.7798	5	35	\N	\N	f	\N	2025-11-26 00:36:19.921679	\N	45	19	\N
1378	Галина Панчко	panchko.halyna@lnu.edu.ua	$2a$06$AZEboFhxnwxudP4AcWg0cO7ujSmlFOmff/zzVRNFkbJ1J11CyrMDm	teacher	2025-11-05 13:29:08.817137	2025-12-07 13:51:44.234381	2025-12-07 13:52:06.973435	32	32	\N	\N	f	2025-11-16 14:29:36.487021	2025-11-05 13:29:08.817137	\N	\N	\N	\N
577	Роман Шувар	shuvar.roman@lnu.edu.ua	$2a$06$ILP9F3aigt.Uux3x.IjWu.wlqBRtlk3XrMgxELhR2GZHQ3.7iSZMO	teacher	2025-11-05 13:10:04.072109	2025-12-14 20:15:30.737095	2025-11-10 00:12:47.868303	5	35	\N	\N	f	\N	2025-11-05 13:10:04.072109	\N	\N	\N	\N
\.


--
-- Data for Name: writing_statistics; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.writing_statistics (id, user_id, chapter_key, word_count, characters_count, images_count, time_spent, session_date, created_at) FROM stdin;
\.


--
-- Name: available_places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.available_places_id_seq', 776, true);


--
-- Name: chat_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.chat_members_id_seq', 12, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 1, false);


--
-- Name: chat_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.chat_participants_id_seq', 1, false);


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.chats_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.departments_id_seq', 118, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.events_id_seq', 6, true);


--
-- Name: faculties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.faculties_id_seq', 19, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.groups_id_seq', 948, true);


--
-- Name: message_read_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.message_read_receipts_id_seq', 245, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.notes_id_seq', 10, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.resources_id_seq', 8, true);


--
-- Name: specialties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.specialties_id_seq', 117, true);


--
-- Name: student_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_achievements_id_seq', 1, true);


--
-- Name: student_activity_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_activity_sessions_id_seq', 18, true);


--
-- Name: student_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_applications_id_seq', 55, true);


--
-- Name: student_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_assignments_id_seq', 1, false);


--
-- Name: student_deadlines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_deadlines_id_seq', 1, false);


--
-- Name: student_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_goals_id_seq', 1, false);


--
-- Name: student_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_profiles_id_seq', 5, true);


--
-- Name: student_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_projects_id_seq', 4, true);


--
-- Name: student_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.student_topics_id_seq', 1, true);


--
-- Name: teacher_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.teacher_comments_id_seq', 1, false);


--
-- Name: teacher_future_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.teacher_future_topics_id_seq', 107, true);


--
-- Name: teacher_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.teacher_profiles_id_seq', 3, true);


--
-- Name: teacher_research_directions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.teacher_research_directions_id_seq', 87, true);


--
-- Name: teacher_students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.teacher_students_id_seq', 1, false);


--
-- Name: teacher_works_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.teacher_works_id_seq', 109, true);


--
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.teachers_id_seq', 48, true);


--
-- Name: user_chapters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.user_chapters_id_seq', 196, true);


--
-- Name: user_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.user_projects_id_seq', 36, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.users_id_seq', 22, true);


--
-- Name: writing_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.writing_statistics_id_seq', 1, false);


--
-- Name: available_places available_places_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.available_places
    ADD CONSTRAINT available_places_pkey PRIMARY KEY (id);


--
-- Name: available_places available_places_teacher_id_specialty_id_course_type_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.available_places
    ADD CONSTRAINT available_places_teacher_id_specialty_id_course_type_key UNIQUE (teacher_id, specialty_id, course, type);


--
-- Name: chat_members chat_members_chat_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_chat_id_user_id_key UNIQUE (chat_id, user_id);


--
-- Name: chat_members chat_members_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_participants chat_participants_chat_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_chat_id_user_id_key UNIQUE (chat_id, user_id);


--
-- Name: chat_participants chat_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: faculties faculties_name_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_name_key UNIQUE (name);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: message_read_receipts message_read_receipts_message_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.message_read_receipts
    ADD CONSTRAINT message_read_receipts_message_id_user_id_key UNIQUE (message_id, user_id);


--
-- Name: message_read_receipts message_read_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.message_read_receipts
    ADD CONSTRAINT message_read_receipts_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: specialties specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_pkey PRIMARY KEY (id);


--
-- Name: student_achievements student_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_achievements
    ADD CONSTRAINT student_achievements_pkey PRIMARY KEY (id);


--
-- Name: student_activity_sessions student_activity_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_activity_sessions
    ADD CONSTRAINT student_activity_sessions_pkey PRIMARY KEY (id);


--
-- Name: student_applications student_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_applications
    ADD CONSTRAINT student_applications_pkey PRIMARY KEY (id);


--
-- Name: student_assignments student_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_assignments
    ADD CONSTRAINT student_assignments_pkey PRIMARY KEY (id);


--
-- Name: student_assignments student_assignments_student_id_place_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_assignments
    ADD CONSTRAINT student_assignments_student_id_place_id_key UNIQUE (student_id, place_id);


--
-- Name: student_deadlines student_deadlines_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_deadlines
    ADD CONSTRAINT student_deadlines_pkey PRIMARY KEY (id);


--
-- Name: student_goals student_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_goals
    ADD CONSTRAINT student_goals_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: student_projects student_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_pkey PRIMARY KEY (id);


--
-- Name: student_topics student_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_topics
    ADD CONSTRAINT student_topics_pkey PRIMARY KEY (id);


--
-- Name: teacher_comments teacher_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_comments
    ADD CONSTRAINT teacher_comments_pkey PRIMARY KEY (id);


--
-- Name: teacher_future_topics teacher_future_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_future_topics
    ADD CONSTRAINT teacher_future_topics_pkey PRIMARY KEY (id);


--
-- Name: teacher_profiles teacher_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_pkey PRIMARY KEY (id);


--
-- Name: teacher_profiles teacher_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_user_id_key UNIQUE (user_id);


--
-- Name: teacher_research_directions teacher_research_directions_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_research_directions
    ADD CONSTRAINT teacher_research_directions_pkey PRIMARY KEY (id);


--
-- Name: teacher_students teacher_students_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_students
    ADD CONSTRAINT teacher_students_pkey PRIMARY KEY (id);


--
-- Name: teacher_students teacher_students_teacher_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_students
    ADD CONSTRAINT teacher_students_teacher_id_student_id_key UNIQUE (teacher_id, student_id);


--
-- Name: teacher_works teacher_works_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_works
    ADD CONSTRAINT teacher_works_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: user_chapters user_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_chapters
    ADD CONSTRAINT user_chapters_pkey PRIMARY KEY (id);


--
-- Name: user_chapters user_chapters_user_project_chapter_unique; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_chapters
    ADD CONSTRAINT user_chapters_user_project_chapter_unique UNIQUE (user_id, project_type, chapter_key);


--
-- Name: user_projects user_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_pkey PRIMARY KEY (id);


--
-- Name: user_projects user_projects_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: writing_statistics writing_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.writing_statistics
    ADD CONSTRAINT writing_statistics_pkey PRIMARY KEY (id);


--
-- Name: idx_available_places_specialty; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_available_places_specialty ON public.available_places USING btree (specialty_id);


--
-- Name: idx_available_places_specialty_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_available_places_specialty_id ON public.available_places USING btree (specialty_id);


--
-- Name: idx_available_places_teacher; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_available_places_teacher ON public.available_places USING btree (teacher_id);


--
-- Name: idx_available_places_teacher_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_available_places_teacher_id ON public.available_places USING btree (teacher_id);


--
-- Name: idx_chat_members_chat_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_members_chat_id ON public.chat_members USING btree (chat_id);


--
-- Name: idx_chat_members_user_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_members_user_id ON public.chat_members USING btree (user_id);


--
-- Name: idx_chat_messages_chat_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages USING btree (chat_id);


--
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- Name: idx_chat_participants_chat_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_participants_chat_id ON public.chat_participants USING btree (chat_id);


--
-- Name: idx_chat_participants_user_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_participants_user_id ON public.chat_participants USING btree (user_id);


--
-- Name: idx_message_read_receipts_message_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_message_read_receipts_message_id ON public.message_read_receipts USING btree (message_id);


--
-- Name: idx_message_read_receipts_user_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_message_read_receipts_user_id ON public.message_read_receipts USING btree (user_id);


--
-- Name: idx_notes_bookmarked; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_notes_bookmarked ON public.notes USING btree (is_bookmarked);


--
-- Name: idx_notes_category; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_notes_category ON public.notes USING btree (category);


--
-- Name: idx_notes_display_order; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_notes_display_order ON public.notes USING btree (display_order);


--
-- Name: idx_notes_public; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_notes_public ON public.notes USING btree (is_public);


--
-- Name: idx_notes_user_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_notes_user_id ON public.notes USING btree (user_id);


--
-- Name: idx_resources_category; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_resources_category ON public.resources USING btree (category);


--
-- Name: idx_resources_created_at; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_resources_created_at ON public.resources USING btree (created_at);


--
-- Name: idx_resources_created_by; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_resources_created_by ON public.resources USING btree (created_by);


--
-- Name: idx_student_applications_created_at; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_student_applications_created_at ON public.student_applications USING btree (created_at);


--
-- Name: idx_student_applications_status; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_student_applications_status ON public.student_applications USING btree (status);


--
-- Name: idx_student_applications_student_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_student_applications_student_id ON public.student_applications USING btree (student_id);


--
-- Name: idx_student_applications_teacher_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_student_applications_teacher_id ON public.student_applications USING btree (teacher_id);


--
-- Name: idx_student_assignments_place_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_student_assignments_place_id ON public.student_assignments USING btree (place_id);


--
-- Name: idx_student_topics_status; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_student_topics_status ON public.student_topics USING btree (status);


--
-- Name: idx_student_topics_student_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_student_topics_student_id ON public.student_topics USING btree (student_id);


--
-- Name: idx_student_topics_teacher_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_student_topics_teacher_id ON public.student_topics USING btree (teacher_id);


--
-- Name: idx_user_chapters_user_project; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_user_chapters_user_project ON public.user_chapters USING btree (user_id, project_type);


--
-- Name: idx_user_projects_user_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_user_projects_user_id ON public.user_projects USING btree (user_id);


--
-- Name: chats update_chats_updated_at; Type: TRIGGER; Schema: public; Owner: vikaosoba
--

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION public.update_chat_timestamp();


--
-- Name: student_applications update_student_applications_updated_at; Type: TRIGGER; Schema: public; Owner: vikaosoba
--

CREATE TRIGGER update_student_applications_updated_at BEFORE UPDATE ON public.student_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: available_places available_places_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.available_places
    ADD CONSTRAINT available_places_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id);


--
-- Name: available_places available_places_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.available_places
    ADD CONSTRAINT available_places_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE;


--
-- Name: chat_members chat_members_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_members chat_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: chat_messages chat_messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_reply_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES public.chat_messages(id);


--
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: chat_participants chat_participants_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_participants chat_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chats chats_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: departments departments_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id) ON DELETE CASCADE;


--
-- Name: teachers fk_teachers_user; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT fk_teachers_user FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: groups groups_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id);


--
-- Name: message_read_receipts message_read_receipts_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.message_read_receipts
    ADD CONSTRAINT message_read_receipts_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;


--
-- Name: message_read_receipts message_read_receipts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.message_read_receipts
    ADD CONSTRAINT message_read_receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: resources resources_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: specialties specialties_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id);


--
-- Name: student_achievements student_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_achievements
    ADD CONSTRAINT student_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_activity_sessions student_activity_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_activity_sessions
    ADD CONSTRAINT student_activity_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_applications student_applications_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_applications
    ADD CONSTRAINT student_applications_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: student_applications student_applications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_applications
    ADD CONSTRAINT student_applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_applications student_applications_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_applications
    ADD CONSTRAINT student_applications_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;


--
-- Name: student_assignments student_assignments_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_assignments
    ADD CONSTRAINT student_assignments_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.available_places(id);


--
-- Name: student_assignments student_assignments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_assignments
    ADD CONSTRAINT student_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: student_deadlines student_deadlines_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_deadlines
    ADD CONSTRAINT student_deadlines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_goals student_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_goals
    ADD CONSTRAINT student_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_projects student_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_topics student_topics_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_topics
    ADD CONSTRAINT student_topics_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: student_topics student_topics_student_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_topics
    ADD CONSTRAINT student_topics_student_id_fkey1 FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: student_topics student_topics_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.student_topics
    ADD CONSTRAINT student_topics_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: teacher_comments teacher_comments_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_comments
    ADD CONSTRAINT teacher_comments_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.user_chapters(id);


--
-- Name: teacher_comments teacher_comments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_comments
    ADD CONSTRAINT teacher_comments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: teacher_future_topics teacher_future_topics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_future_topics
    ADD CONSTRAINT teacher_future_topics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teacher_profiles teacher_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teacher_research_directions teacher_research_directions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_research_directions
    ADD CONSTRAINT teacher_research_directions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teacher_students teacher_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_students
    ADD CONSTRAINT teacher_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: teacher_students teacher_students_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_students
    ADD CONSTRAINT teacher_students_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: teacher_works teacher_works_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teacher_works
    ADD CONSTRAINT teacher_works_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: user_chapters user_chapters_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_chapters
    ADD CONSTRAINT user_chapters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_projects user_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: users users_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id);


--
-- Name: writing_statistics writing_statistics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.writing_statistics
    ADD CONSTRAINT writing_statistics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

