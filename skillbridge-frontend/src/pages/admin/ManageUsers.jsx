import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getUsers, updateUserStatus } from '../../services/adminService';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const response = await getUsers();
    setUsers(response.data);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleStatus(user) {
    const status = user.status === 'active' ? 'inactive' : 'active';
    await updateUserStatus(user.id, status);
    setMessage(`User marked ${status}.`);
    loadUsers();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Manage users</h1>
      <AlertMessage type="success" message={message} />
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td><button className="btn btn-outline-primary btn-sm" onClick={() => toggleStatus(user)}>Toggle status</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
