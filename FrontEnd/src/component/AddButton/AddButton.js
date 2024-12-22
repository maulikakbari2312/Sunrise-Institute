
import React, { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { Button, Typography } from "@mui/material";
import CommonModal from "component/CommonModal/CommonModal";
import { useApi } from "network/api";
import { toast } from "react-toastify";

function AddButton({ url, setIsFetch }) {
    const [userData, setUserData] = useState(null); // Local state to store user data
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { getApi } = useApi();
    const user = useSelector((state) => state.selected.modelData);
    useEffect(() => {
        setUserData(user);
    }, [user]);

    const [fileDataNames, setFileDataNames] = useState('');

    const conterNumber = async () => {
        try {
            const response = await getApi(`/api/enroll/find-book-numbers/false`);
            const data = response?.pageItems;
            setFileDataNames(`${Object.keys(data)[0]}-${Object.values(data)[0]}`);
            return `${Object.keys(data)[0]}-${Object.values(data)[0]}`;
        } catch (error) {
            toast.error(error?.message || "Please Try After Sometime");
        }
    }
    useEffect(() => {
        const tempCount =async()=>{
            await conterNumber();
        }
        tempCount();
    }, [isDialogOpen]);

    return (
        <>
            <Button
                startIcon={<AddIcon fontSize="16px" />}
                variant="contained"
                alignItems="center"
                onClick={() => {
                    setIsDialogOpen(true);
                }}
            >
                <Typography pt="2px" >
                    {userData?.btnTitle}
                </Typography>
            </Button>
            <CommonModal
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                userData={userData}
                url={url}
                setIsFetch={setIsFetch}
                fileDataNames={fileDataNames}
            />
        </>
    );
}

export default AddButton;
