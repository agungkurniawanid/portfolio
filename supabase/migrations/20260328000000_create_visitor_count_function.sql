CREATE OR REPLACE FUNCTION count_distinct_visitors()
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT fingerprint) FROM visitor_ip_log);
END;
$$ LANGUAGE plpgsql;
