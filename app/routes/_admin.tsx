import {createContext, useState, useContext, Dispatch, SetStateAction} from 'react'
import {Outlet} from '@remix-run/react'

const AdminContext =
  createContext<{admin: boolean; setAdmin: Dispatch<SetStateAction<boolean>> } | undefined>(undefined)

export default function Admin() {
  const [admin, setAdmin] = useState(false)
  
  return (
    <AdminContext.Provider value={{admin, setAdmin}}>
      <Outlet />
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
