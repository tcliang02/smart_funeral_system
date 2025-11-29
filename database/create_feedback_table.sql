-- Create feedback table for contact form submissions and other feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  feedback_id SERIAL NOT NULL,
  user_id INTEGER NULL,
  feedback_type CHARACTER VARYING(20) NOT NULL,
  name CHARACTER VARYING(100) NOT NULL,
  email CHARACTER VARYING(100) NOT NULL,
  message TEXT NOT NULL,
  status CHARACTER VARYING(20) NULL DEFAULT 'pending'::CHARACTER VARYING,
  admin_notes TEXT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id),
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL,
  CONSTRAINT feedback_feedback_type_check CHECK (
    (feedback_type)::TEXT = ANY (
      (
        ARRAY[
          'bug'::CHARACTER VARYING,
          'feature'::CHARACTER VARYING,
          'general'::CHARACTER VARYING
        ]
      )::TEXT[]
    )
  ),
  CONSTRAINT feedback_status_check CHECK (
    (status)::TEXT = ANY (
      (
        ARRAY[
          'pending'::CHARACTER VARYING,
          'reviewed'::CHARACTER VARYING,
          'resolved'::CHARACTER VARYING,
          'closed'::CHARACTER VARYING
        ]
      )::TEXT[]
    )
  )
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id 
  ON public.feedback USING btree (user_id) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_feedback_type 
  ON public.feedback USING btree (feedback_type) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_feedback_status 
  ON public.feedback USING btree (status) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_feedback_created_at 
  ON public.feedback USING btree (created_at) 
  TABLESPACE pg_default;

