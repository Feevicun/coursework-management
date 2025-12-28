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
    current_students integer DEFAULT 0
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
    updated_at timestamp without time zone DEFAULT now()
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
    updated_at timestamp without time zone DEFAULT now()
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
    time character varying(5),
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
    education_level character varying(10)
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
    student_id_number character varying(50)
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
    created_at timestamp without time zone DEFAULT now()
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
    updated_at timestamp without time zone DEFAULT now()
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
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


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
-- Name: chats chats_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: departments departments_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id) ON DELETE CASCADE;


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
-- Name: teachers fk_teachers_user; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT fk_teachers_user FOREIGN KEY (id) REFERENCES public.users(id);


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