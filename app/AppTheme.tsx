import { App as AntdApp, ConfigProvider } from "antd";

export default function AppTheme({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          // colorPrimary: "#5573ee",
          colorPrimary: "#1f2937",
          borderRadius: 4,
          lineWidth: 1,
          //colorBorder: "#ECDFD1",
          // colorBorder: "#bababa",

          // Alias Token
          // colorBgContainer: "#f6ffed",
        },

        components: {
          Message: {},
          Form: {
            itemMarginBottom: 14,
          },

          Input: {
            paddingBlockSM: 6,
            paddingInlineSM: 10,
            borderRadiusSM: 5,
            borderRadiusLG: 12,
          },

          Button: {
            paddingBlockLG: 13,
            borderRadius: 30,
            borderRadiusSM: 20,
          },

          Select: {
            borderRadiusSM: 5,
            paddingSM: 12,
            controlHeightSM: 36,
          },

          DatePicker: {
            controlHeightSM: 36,
            borderRadiusSM: 5,
          },

          ColorPicker: {
            borderRadiusSM: 5,
            borderRadius: 5,
            borderRadiusOuter: 5,
          },

          Modal: {
            borderRadiusOuter: 10,

            borderRadiusLG: 12,

            headerBg: "#f7f7f7",
          },
          Radio: {
            borderRadius: 30,
          },

          Divider: {
            margin: 0,
            verticalMarginInline: 0,
            orientationMargin: 0,
            marginLG: 12,
          },
          Drawer: {},
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
