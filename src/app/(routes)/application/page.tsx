"use client";

import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import ApplicationForm from './ApplicationForm'
import ClientInfoStep from './steps/ClientInfoStep'
import EmploymentStep from './steps/EmploymentStep'
import IncomeStep from './steps/IncomeStep'
import RealEstateStep from './steps/RealEstateStep'
import DocumentsStep from './steps/DocumentsStep'
import AssetStep from './steps/AssetStep'
import DictateStep from './steps/DictateStep'
import ReviewStep from './steps/ReviewStep'

export default function ApplicationPage() {
  return (
    <BrowserRouter basename="/application">
      <Routes>
      <Route path="/" element={<ApplicationForm />}>
        <Route index element={<Navigate to="client-info" replace />} />
        <Route path="client-info" element={<ClientInfoStep />} />
        <Route path="employment" element={<EmploymentStep />} />
        <Route path="income" element={<IncomeStep />} />
        <Route path="real-estate" element={<RealEstateStep />} />
        <Route path="assets" element={<AssetStep />} />
        <Route path="documents" element={<DocumentsStep />} />
        <Route path="dictate" element={<DictateStep />} />
        <Route path="review" element={<ReviewStep />} />
      </Route>
    </Routes>
    </BrowserRouter>
  );
}


