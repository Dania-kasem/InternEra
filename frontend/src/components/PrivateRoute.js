import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // جلب التوكن والـ role الموحدين من النظام الجديد
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 🛡️ التحقق: إذا كان التوكن موجوداً والمستخدم يحمل صلاحية admin بالفعل، اسمح له بالدخول
  if (token && role === 'admin') {
    return children;
  }

  // 🚪 إذا لم يكن أدمن أو لم يسجل دخوله، اطرد المستخدم وأعده لصفحة تسجيل الدخول الموحدة
  return <Navigate to="/login" />;
};

export default PrivateRoute;