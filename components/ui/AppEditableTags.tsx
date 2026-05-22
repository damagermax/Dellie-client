import { PlusOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Flex, Input, Tag, Tooltip } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface EditableTagsProps {
    value?: string[];
    onChange?: (tags: string[]) => void;
    placeholder?: string;
}

const tagInputStyle: React.CSSProperties = {
    width: 124,
    height: 32,
    marginInlineEnd: 8,
    verticalAlign: "top",
};

const AppEditableTags: React.FC<EditableTagsProps> = ({ value = [], onChange, placeholder = 'New Tag' }) => {
    const [localTags, setLocalTags] = useState<string[]>(value);
    const prevValueRef = useRef(value);
    
    // Sync with parent value only when it changes from parent
    useEffect(() => {
        // Only update if the value prop has actually changed
        if (JSON.stringify(prevValueRef.current) !== JSON.stringify(value)) {
            setLocalTags(value);
            prevValueRef.current = value;
        }
    }, [value]);
    
    const updateTags = useCallback((newTags: string[]) => {
        setLocalTags(newTags);
        onChange?.(newTags);
    }, [onChange]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [editIndex, setEditIndex] = useState<number>(-1);
    const [editValue, setEditValue] = useState("");

    const inputRef = useRef<InputRef>(null);
    const editRef = useRef<InputRef>(null);

    useEffect(() => {
        if (inputVisible) inputRef.current?.focus();
    }, [inputVisible]);

    useEffect(() => {
        if (editValue) editRef.current?.focus();
    }, [editValue]);

    const addTag = () => {
        if (inputValue && !localTags.includes(inputValue)) {
            const newTags = [...localTags, inputValue];
            updateTags(newTags);
        }
        setInputVisible(false);
        setInputValue("");
    };

    const editTag = () => {
        const newTags = [...localTags];
        newTags[editIndex] = editValue;
        updateTags(newTags);
        setEditIndex(-1);
        setEditValue("");
    };

    return (
        <Flex gap="4px 0" wrap>
            {localTags.map((tag, i) =>
                editIndex === i ? (
                    <Input
                        ref={editRef}
                        style={tagInputStyle}
                        key={tag}
                        size="small"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={editTag}
                        onPressEnter={editTag}
                    />
                ) : (
                    <Tooltip title={tag.length > 20 ? tag : ""} key={tag}>
                        <Tag
                            className=" !py-1 !px-3 !rounded-full  bg-blue-300 cursor-pointer"
                            closable
                            style={{ userSelect: "none" }}
                            onClose={() => updateTags(localTags.filter((t) => t !== tag))}
                        >
                            <span
                                onClick={() => {
                                    setEditIndex(i);
                                    setEditValue(tag);
                                }}
                            >
                                {tag.length > 20 ? `${tag.slice(0, 20)}...` : tag}
                            </span>
                        </Tag>
                    </Tooltip>
                )
            )}
            {inputVisible ? (
                <Input
                    ref={inputRef}
                    style={tagInputStyle}
                    size="small"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={addTag}
                    onPressEnter={addTag}
                />
            ) : (
                <Tag
                    className=" !py-1 !px-3 !rounded-full !cursor-pointer"
                    style={{ background: "#fff", borderStyle: "dashed" }}
                    icon={<PlusOutlined />}
                    onClick={() => setInputVisible(true)}
                >
                    {placeholder}
                </Tag>
            )}
        </Flex>
    );
};

export default AppEditableTags;
