import Avatar from '../common/Avatar';

export default function TeamMembers({ members, workload, onAddUser }) {
  return (
    <aside className="team-panel">
      <div className="section-heading"><div><span className="eyebrow">PROJECT TEAM</span><h2>Team members</h2></div><button className="add-member" onClick={onAddUser}>+</button></div>
      <div className="member-list">{members.map((member) => { const stats = workload.find((item) => item.user_id === member.user_id) || { in_progress_count: 0, overloaded: false }; return <div className="member-row" key={member.user_id}><Avatar name={member.name} overloaded={stats.overloaded} /><div className="member-info"><strong>{member.name}</strong><span>{member.role}</span></div><span className="member-count">{stats.in_progress_count}<small> in progress</small></span></div>; })}</div>
    </aside>
  );
}
