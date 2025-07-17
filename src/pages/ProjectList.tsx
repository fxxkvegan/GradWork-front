import React from "react";
import { Container, Typography, Box } from "@mui/material";
import AppHeader from "../component/AppHeader";

const ProjectList: React.FC = () => {
  return (
    <>
      <AppHeader activePath="/projects" />
      <Container maxWidth="lg" sx={{ pt: 5, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom>
          プロジェクト一覧
        </Typography>
        <Box>
          {/* 本来はここに ProjectCard のリストをマッピングして表示 */}
          <Typography>ここに一覧が表示されます。</Typography>
        </Box>
      </Container>
    </>
  );
};

export default ProjectList;
