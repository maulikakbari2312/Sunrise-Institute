
import React, { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { Button, Typography } from "@mui/material";
import CommonModal from "component/CommonModal/CommonModal";

function AddButton({ url, setIsFetch }) {
    const [userData, setUserData] = useState(null); // Local state to store user data
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const user = useSelector((state) => state.selected.modelData);
    useEffect(() => {
        setUserData(user);
    }, [user]);

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
            />
        </>
    );
}

export default AddButton;
