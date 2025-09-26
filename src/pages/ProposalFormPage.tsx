import React from "react";
import { ProposalForm } from "@/components/forms/ProposalForm";
import { useNavigate } from "react-router-dom";

const ProposalFormPage = () => {
  const navigate = useNavigate();

  return (
    <ProposalForm onBack={() => navigate('/')} />
  );
};

export default ProposalFormPage;
