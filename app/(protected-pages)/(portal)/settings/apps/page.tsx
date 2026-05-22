"use client";

import { AppstoreOutlined, CheckCircleOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Image, message, Typography } from "antd";
import { useState } from "react";

const { Text } = Typography;

interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "install" | "uninstall";
  installedDate: string;
  version?: string;
  developer: string;
  logo?: string;
}

export default function AppsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [apps, setApps] = useState<App[]>([
    {
      id: "1",
      name: "Paystack",
      description: "Online payments for Africa. Accept payments with cards, bank transfers, and USSD.",
      category: "Payments",
      status: "install",
      installedDate: new Date().toISOString().split("T")[0],
      developer: "Paystack",
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAY1BMVEUBGzMJpdsJqeAAABsAAB0Im84AECkBGDAJreYCL0oFaZACNlIFZYsJodYAAB8JotkIlMYHjb0FXH8ACiQADSYAFCwHg7EHh7YEVHYHe6YCKkQETm8DRGMGbpYCJj8DPlwGdZ/B21UTAAADF0lEQVR4nO3d4XKiMBRAYUiBRNQUCUFFrb7/U66ubvtbzeVmO+d7gM6cQau5xFAUAAAAAAAAAAAAAAAAAIBfzDahUhEGO0vgUKzGWsXmNPkZAv3JGVOqMMaNUfwy+lEp7xFZW+HE4aQaeE3cVKKBtnC6gWXpjlGysFkpX8LrRRyDZGHYqheWtWhhVWv3leVnQyGFFGqjkEIKtfsopJBCCv//wixWT4NkYdOqF5qt6PrQTupTDLMTnWIUYa89ieqkR6ZNpztNLCfpgakdRqfWaFz3Jfsa/cuf991aRT0ewix3LmLw1YeCqgozXEAAQCI2NqqkPzNitehbTatDI7qACufOGV3OXBq57zahV18/lbfb+YVUYjzkEHhLlFoH+0/ttgezkhnXxF0el7AUu9mtvsT/4RYi70SfwTTxQWhek8O89MH0FFJIoTYKKaRQH4UUUqhPqNB32mHf3EGkcLhksz40XyLrw3jOZo3fCQ1qPnRvcv8QepHeNmNop925vdiGhbhY619F4y6COzJibGuny2yOsltOmqpYaJrCDPfzrSrxPACYw2//JzpUX0sVk59l4160p7XWl5lyP4luY78HLjW/lxqzE93lfWUXyt+7xVZN/2SwPpR9K8aj+hrftKJvxRzmNFLji7sqg1nbWnTLVw7zUn7ZRSGF2n0UUkghhRRSSKF8YQ57hNeyJw5ksM9bdn0Yd+qF5iK6Piz8Wr1QZo/+N/XfzLhWepwYeq3zWe+BkjfwHwbF3665ejfHMbuxmvqVin75MdMP8rV+Qyp/hjAAIJkYUhxPk/FhM/441p/vq8ejz/LzzTbbROdEGbfN8iM8JrzNbeoMX6hV0kW+2UsvhZ6W+sw9oZ+cv6FJ/PAHc5IdSTwvbBIXyh7z+ILk89INhXOjkEIK9VFIIYX6KKQw/8Lk9/GzKwyJn34o/Ji4F6R+dp7U2YCvszZxodgRli8b2pSDGtfmNsQobs8hTZfoxjnuWT/NtybJXoXrX2llHyn6siH2Y/e+sY8ZvkQfmuDfF3L7LwoAAAAAAAAAAAAAAAAAyMMfLaaOu1xmU6AAAAAASUVORK5CYII=",
    },
    {
      id: "2",
      name: "MTN Mobile Money",
      description: "Mobile money payments for customers with MTN mobile money accounts",
      category: "Mobile Money",
      status: "uninstall",
      installedDate: new Date().toISOString().split("T")[0],
      developer: "MTN",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZmCMBsoxG-pDYAGoUumdgI8LpGzjm2KSukg&s",
    },
    {
      id: "3",
      name: "Telecel Cash",
      description: "Mobile money payments for customers with Telecel Cash accounts",
      category: "Mobile Money",
      status: "uninstall",
      installedDate: new Date().toISOString().split("T")[0],
      developer: "Telecel",
      logo: "https://ebindmomo.apps.cbg.com.gh/assets/img/T-Cash%20Red.png",
    },
    {
      id: "4",
      name: "AT Money",
      description: "Mobile money payments for customers with AT Money accounts",
      category: "Mobile Money",
      status: "uninstall",
      installedDate: new Date().toISOString().split("T")[0],
      developer: "AT",
      logo: "data:image/png;base64,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",
    },
  ]);

  const showModal = (app?: App) => {
    setEditingApp(app || null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingApp(null);
  };

  const toggleAppStatus = (id: string) => {
    setApps(apps.map((app) => (app.id === id ? { ...app, status: app.status === "install" ? "uninstall" : "install" } : app)));
    message.success("App status updated");
  };

  const handleSubmit = (values: any) => {
    if (editingApp) {
      // Update existing app
      setApps(apps.map((app) => (app.id === editingApp.id ? { ...app, ...values } : app)));
      message.success("App updated successfully");
    } else {
      // Add new app
      const newApp = {
        ...values,
        id: Date.now().toString(),
        status: values.status || "install",
        installedDate: new Date().toISOString().split("T")[0],
      };
      setApps([...apps, newApp]);
      message.success("App added successfully");
    }
    setIsModalVisible(false);
    setEditingApp(null);
  };

  return (
    <div className="space-y-6 w-[70%]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Apps & Integrations</h2>
          <p className="text-sm text-gray-500 mt-1">Connect and manage your payment gateways and other integrations</p>
        </div>
        <div className="flex gap-3">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} className="flex items-center gap-1">
            Add Integration
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {apps.map((app) => (
          <Card key={app.id} className="border border-gray-200 hover:border-blue-300 transition-all duration-200 bg-white !rounded-lg   hover:shadow-md" bodyStyle={{ padding: "16px 20px" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-grow">
                <div className="flex-shrink-0 h-14 w-14 flex items-center justify-center bg-white rounded-lg border border-gray-100 overflow-hidden">
                  <div className="h-full w-full flex items-center justify-center bg-gray-50">
                    {app.logo ? (
                      <Image
                        src={app.logo}
                        alt={`${app.name} logo`}
                        preview={false}
                        className="h-full w-full   object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div className="hidden absolute items-center justify-center">
                      <AppstoreOutlined className="text-gray-400 text-2xl" />
                    </div>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-medium">{app.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-gray-400">By</span>
                      <span className="font-medium">{app.developer}</span>
                    </span>
                    <span>•</span>
                    <span>{app.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                {app.status === "install" ? (
                  <Button icon={<CheckCircleOutlined />} type="default" size="small" onClick={() => toggleAppStatus(app.id)} className="flex items-center gap-1 text-gray-700 border-gray-300">
                    Uninstall
                  </Button>
                ) : (
                  <Button type="primary" size="small" onClick={() => toggleAppStatus(app.id)} className="flex items-center gap-1" icon={app.status != "uninstall" ? <SettingOutlined /> : <PlusOutlined />}>
                    {app.status != "uninstall" ? "Uninstall" : "Setup"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
