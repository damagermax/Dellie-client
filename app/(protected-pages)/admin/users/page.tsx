"use client";

import { SearchOutlined, FilterOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Input, Row, Space, Table, Tag, Tooltip, Typography, Modal, Badge, Select } from "antd";
import { useState, useEffect } from "react";
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'store_owner' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  stores?: number;
  avatar?: string;
  registrationDate: string;
}

const roleColors = {
  admin: 'red',
  store_owner: 'blue',
  customer: 'green'
};

const statusIcons = {
  active: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  inactive: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  suspended: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    role: undefined as string | undefined,
    status: undefined as string | undefined
  });

  useEffect(() => {
    // Simulate API call
    const fetchUsers = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            status: 'active',
            lastLogin: '2023-06-15T10:30:00',
            registrationDate: '2023-01-10',
            stores: 3
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'store_owner',
            status: 'active',
            lastLogin: '2023-06-14T15:45:00',
            registrationDate: '2023-02-15',
            stores: 2
          },
          {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'customer',
            status: 'inactive',
            lastLogin: '2023-05-20T09:15:00',
            registrationDate: '2023-03-20'
          },
          {
            id: '4',
            name: 'Alice Williams',
            email: 'alice@example.com',
            role: 'store_owner',
            status: 'suspended',
            lastLogin: '2023-04-05T14:20:00',
            registrationDate: '2023-01-05',
            stores: 1
          },
          {
            id: '5',
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            role: 'customer',
            status: 'active',
            lastLogin: '2023-06-12T11:10:00',
            registrationDate: '2023-02-28'
          }
        ];
        
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const confirmDelete = (userId: string) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk() {
        // Handle delete action
        setUsers(users.filter(user => user.id !== userId));
      },
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.avatar} 
            icon={<UserAddOutlined />} 
            className="mr-3"
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-gray-500 text-xs">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={roleColors[role]}>
          {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Store Owner', value: 'store_owner' },
        { text: 'Customer', value: 'customer' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div className="flex items-center">
          {statusIcons[status]}
          <span className="ml-2 capitalize">{status}</span>
        </div>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Stores',
      dataIndex: 'stores',
      key: 'stores',
      render: (stores) => stores || 'N/A',
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit User">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => confirmDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">User Management</Title>
        <Button type="primary" icon={<UserAddOutlined />}>
          Add New User
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Search
            placeholder="Search users..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            className="max-w-md"
          />
          
          <div className="flex gap-4">
            <Select
              placeholder="Filter by Role"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('role', value)}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'store_owner', label: 'Store Owner' },
                { value: 'customer', label: 'Customer' },
              ]}
            />
            
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
            
            <Button icon={<FilterOutlined />}>
              More Filters
            </Button>
          </div>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredUsers} 
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`
          }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default UsersPage;
