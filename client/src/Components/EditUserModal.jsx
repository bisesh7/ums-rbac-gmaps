import { Alert, Col, Form, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useState } from "react";
import styles from "../Styles/main.module.scss";
import classNames from "classnames";

function EditUserModal({ show, handleClose, user, fetchUsers }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("danger");
  const [message, setMessage] = useState("");

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required."),
    firstName: Yup.string().required("First name is required."),
    lastName: Yup.string().required("Last name is required."),
    password: Yup.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("password")],
      "Passwords need to match",
    ),
    role: Yup.string().required("Role is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: user?.username,
      password: "",
      confirmPassword: "",
      profilePicture: null,
      firstName: user?.firstName,
      lastName: user?.lastName,
      role: user?.role,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      editUser(values);
    },
  });

  const editUser = async (values) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append("role", values.role);
      if (values.password) {
        formData.append("password", values.password);
      }
      if (values.profilePicture) {
        formData.append("profilePicture", values.profilePicture);
      }

      const response = await axios.put(
        `http://localhost:5002/api/users/${user._id}`,

        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessage("User edited successfully!");
      setAlertVariant("success");
      setShowAlert(true);
      fetchUsers();
      handleClose();
    } catch (err) {
      setMessage(err.response?.data?.error || "Error editing user");
      setAlertVariant("danger");
      setShowAlert(true);
      console.error("Error editing user", err.response?.data || err.message);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        dialogClassName="modal-xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <div className={classNames("d-flex", "justify-content-center", "mt-2")}>
          <Form
            noValidate
            className={classNames(styles.signupComponent)}
            onSubmit={formik.handleSubmit}
          >
            {showAlert && (
              <Alert
                variant={alertVariant}
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {message}
              </Alert>
            )}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                First Name
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={
                    formik.touched.firstName && formik.errors.firstName
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.firstName}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                Last Name
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={formik.values.lastName}
                  name="lastName"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.lastName && formik.errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.lastName}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                Profile Picture
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="file"
                  placeholder="Profile Picture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={(e) =>
                    formik.setFieldValue(
                      "profilePicture",
                      e.currentTarget.files[0],
                    )
                  }
                  onBlur={formik.handleBlur}
                  isInvalid={
                    formik.touched.profilePicture &&
                    formik.errors.profilePicture
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.profilePicture}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                Username
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  placeholder="Username"
                  value={formik.values.username}
                  name="username"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.username && formik.errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.username}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                Role
              </Form.Label>
              <Col sm="9">
                <Form.Select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.role && formik.errors.role}
                >
                  <option>Select Role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="ROLE_1">Role 1</option>
                  <option value="ROLE_2">Role 2</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.role}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                Password
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={formik.values.password}
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.password && formik.errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.password}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                Confirm Password
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.confirmPassword}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                Edit User
              </Button>
            </Modal.Footer>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default EditUserModal;
