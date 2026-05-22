export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className=" grid xl:grid-cols-2  ">
      <div className=" w-full h-screen hidden xl:block"></div>
      <div className=" bg-gray-100">{children}</div>
    </div>
  );
}
