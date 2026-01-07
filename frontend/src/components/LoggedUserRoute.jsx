import { Navigate } from "react-router-dom"
import { getStoredUser } from "../api.js"

export default function loggedUserRoute ({ children }) {
  const user = getStoredUser()
  if (!user) return <Navigate to="/login" replace />
  return children
}