import React from "react";
import { Container, Typography, Box } from "@mui/material";
import AppHeader from "../component/AppHeader";

import { useSearchParams } from "react-router-dom";

const ProjectList: React.FC = () => {

  const [params] = useSearchParams();
  const category = params.get("category") || "すべて";

  return (
    <>
      <AppHeader activePath="/projects" />
      <Container maxWidth="lg" sx={{ pt: 5, px: { xs: 2, sm: 3, md: 4 } }}>
        <div style = {{position: 'relative', paddingTop: 30}}>
          <Typography variant="h4" gutterBottom>
            {category}プロジェクト一覧
          </Typography>
        </div>
        <Box>
          {/* 本来はここに ProjectCard のリストをマッピングして表示 */}
          <Typography>ここに一覧が表示されます。</Typography>
        </Box>
      </Container>
    </>
  );
};

export default ProjectList;
