import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";

const UploadTimer = ({ isUploading, onSave }) => {
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer;

    if (isUploading) {
      if (!startTime) {
        setStartTime(Date.now());
        setElapsed(0);
      }

      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timer) {
        clearInterval(timer);
      }
      setElapsed(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isUploading, startTime]);

  return (
    <Button
      variant="contained"
      color={isUploading ? "secondary" : "primary"}
      onClick={onSave}
      disabled={isUploading}
    >
      {isUploading ? `Saving... ${elapsed}s` : "Save Book"}
    </Button>
  );
};

export default UploadTimer;
