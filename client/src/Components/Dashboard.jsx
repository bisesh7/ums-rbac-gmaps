import { useState } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { AiOutlineDelete } from "react-icons/ai";
import { FaUserEdit } from "react-icons/fa";
import styles from "../Styles/main.module.scss";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Pagination from "react-responsive-pagination";
import classNames from "classnames";
import DeleteUserModal from "./DeleteUserModal";
import EditUserModal from "./EditUserModal";

const AdminDashboard = () => {
  const [roleFilter, setRoleFilter] = useState();
  const [userRole, setUserRole] = useState("admin");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState();
  const user = JSON.parse(localStorage.getItem("user") || {});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleCloseEditModal = () => setShowEditModal(false);

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5002/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Error deleting user";
      if (errorMessage === "SuperAdmin cannot be deleted") {
        alert("Cannot delete Super Admin");
      } else {
        console.log("Error deleting user: ", err);
      }
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        // Checking the role of the user
        const response = await axios.get(
          "http://localhost:5002/api/auth/role",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!["ADMIN", "ROLE_1"].includes(response.data.role)) {
          navigate("/");
        } else {
          setUserRole(response.data.role);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await axios.get("http://localhost:5002/api/users", {
        params: { role: roleFilter, page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching users: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole) fetchUsers();
  }, [roleFilter, page, userRole]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) return "loading..";

  return (
    <div>
      <Container>
        <div className="d-flex justify-content-between mt-4">
          <h3>Admin Dashboard</h3>
          <div className="d-flex">
            <h3>Hello {`${user.firstName} ${user.lastName}`}</h3>
            <span
              className={classNames("ms-4", "mt-2", styles.logout)}
              href="/"
              onClick={() => {
                handleLogout();
              }}
            >
              Logout
            </span>
          </div>
        </div>

        <div className="d-flex justify-content-end w-20">
          <Form.Select
            value={roleFilter}
            className={styles.roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="ROLE_1">Role 1</option>
            <option value="ROLE_2">Role 2</option>
          </Form.Select>
        </div>
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Profile Picture</th>
              <th>Username</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Updated At</th>
              {userRole === "ADMIN" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users?.map((user, index) => (
              <tr key={user._id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>
                  <div className="d-flex justify-content-center">
                    {user.profilePicture ? (
                      <img
                        src={`http://localhost:5002${user.profilePicture}`}
                        alt="profile"
                        width={50}
                      />
                    ) : (
                      "N/A"
                    )}
                  </div>
                </td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>{new Date(user.updatedAt).toLocaleString()}</td>
                {userRole === "ADMIN" && (
                  <td>
                    <div className="d-flex justify-content-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setUserToEdit(user);
                          setShowEditModal(true);
                        }}
                      >
                        <FaUserEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-1"
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                      >
                        <AiOutlineDelete />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-center mt-3">
          <Pagination
            current={page}
            total={totalPages}
            onPageChange={setPage}
            maxWidth={5}
          />
        </div>
      </Container>
      <DeleteUserModal
        showDeleteModal={showDeleteModal}
        handleCloseDeleteModal={handleCloseDeleteModal}
        userToDelete={userToDelete}
        handleDeleteUser={handleDeleteUser}
      />
      <EditUserModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        user={userToEdit}
        fetchUsers={fetchUsers}
      />
    </div>
  );
};

export default AdminDashboard;
