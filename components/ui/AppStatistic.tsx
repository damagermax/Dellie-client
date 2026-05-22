import { RiShoppingBag2Fill } from "react-icons/ri";

export function AppStatistic({
    style,
    background,
    icon,
    title,
}: {
    icon?: React.ReactNode;
    background?: string;
    title: string;
    style?: Record<string, string>;
}) {
    return (
        <div
            className=" m-2  rounded-md bg-white flex p-5 gap-x-5  items-center border border-solid -border-y-0 -border-l-0 !border-gray-200"
            style={style}
        >
            <div
                style={{ background: background }}
                className="w-[3.14rem] h-[3.14rem] bg-gray-400 flex items-center justify-center text-white text-xl rounded-full"
            >
                {icon || <RiShoppingBag2Fill />}
            </div>

            <div>
                <p className=" text-gray-600  text-[0.9rem]">{title}</p>
                <h4 className=" number  text-gray-500 font-semibold text-[1.5rem] leading-[2rem]">0</h4>
            </div>
        </div>
    );
}
