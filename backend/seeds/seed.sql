INSERT INTO users (id, name, email)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Ava Patel', 'ava@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'Liam Chen', 'liam@example.com'),
  ('00000000-0000-0000-0000-000000000003', 'Maya Singh', 'maya@example.com')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

INSERT INTO projects (id, name, description)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Product Launch', 'Tasks for the product launch.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO project_users (project_id, user_id, role)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'admin'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'member')
ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO tasks (id, project_id, title, description, priority, status, due_date, assigned_to)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Prepare launch checklist', 'Review launch readiness with the team.', 'High', 'In Progress',
   CURRENT_DATE + 7, '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'Publish release notes', 'Write and publish the release notes.', 'Medium', 'To-Do',
   CURRENT_DATE + 14, '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   'Confirm support coverage', 'Confirm support coverage for launch day.', 'Low', 'Done',
   CURRENT_DATE - 1, '00000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;
