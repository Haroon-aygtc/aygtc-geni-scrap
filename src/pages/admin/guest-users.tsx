import React from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import GuestUserManagement from "@/components/admin/GuestUserManagement";
import { Helmet } from "react-helmet";

const GuestUsersPage: React.FC = () => {
  return (
    <AdminLayout>
      <Helmet>
        <title>Guest Users Management | Admin Dashboard</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Guest Users Management</h1>
        <GuestUserManagement />
      </div>
    </AdminLayout>
  );
};

export default GuestUsersPage;
