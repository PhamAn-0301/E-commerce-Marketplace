import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BuyerHome from '../components/BuyerHome';
import ShopHome from '../../seller/components/ShopHome';
import AdminHome from '../../admin/components/AdminHome';
import API from '../../../shared/services/api';
import styles from './Home.module.css';

// Hàm lấy role từ user prop, localStorage hoặc context tuỳ app
function getUserRole(user) {
  // Ưu tiên lấy từ prop user nếu có
  if (user && user.role) return user.role;
  // Hoặc lấy từ localStorage nếu cần
  // return localStorage.getItem('role');
  return null; // Mặc định chưa đăng nhập
}

export default function Home({ user }) {
  const role = getUserRole(user);

  if (role === 'seller') return <ShopHome />;
  if (role === 'admin') return <AdminHome />;
  // Buyer hoặc chưa đăng nhập: truyền toàn bộ props cho BuyerHome
  return <BuyerHome user={user} />;
}