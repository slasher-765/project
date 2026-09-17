import { useCallback, useEffect, useState } from 'react';
import { getProjects, getProjectUsers, getWorkload } from '../api/projects';
import { getTasks } from '../api/tasks';
import { getUsers } from '../api/users';

export function useProjectData() {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (projectId) => {
    if (!projectId) return;
    const [taskResponse, memberResponse, userResponse, workloadResponse] = await Promise.all([
      getTasks(projectId), getProjectUsers(projectId), getUsers(), getWorkload(projectId)
    ]);
    setTasks(taskResponse.data);
    setMembers(memberResponse.data);
    setUsers(userResponse.data);
    setWorkload(workloadResponse.data);
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await getProjects();
        if (!active) return;
        const selected = response.data[0];
        if (!selected) throw new Error('No project is available.');
        setProject(selected);
        await refresh(selected.id);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [refresh]);

  return { project, tasks, setTasks, members, users, workload, loading, error, refresh, setError };
}
