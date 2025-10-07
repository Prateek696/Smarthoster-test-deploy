import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Send, 
  RefreshCw,
  FileCheck,
  Clock,
  Users
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { 
  validateSibaSubmissionAsync, 
  sendSibaSubmissionAsync,
  clearValidation,
  clearSubmission
} from '../../store/sibaManager.slice';
import { sanitizeUserErrorMessage } from '../../utils/errorSanitizer';

interface SibaManagerToolsProps {
  reservation: any;
  propertyId: number;
  onSibaSent?: (submissionId: string) => void;
}

const SibaManagerTools: React.FC<SibaManagerToolsProps> = ({ 
  reservation, 
  propertyId, 
  onSibaSent 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { validation, submission } = useSelector((state: RootState) => state.sibaManager);
  
  const [showValidation, setShowValidation] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);

  const handleValidate = async () => {
    dispatch(clearValidation());
    await dispatch(validateSibaSubmissionAsync({ propertyId, reservationData: reservation }));
    setShowValidation(true);
  };

  const handleSendSiba = async () => {
    dispatch(clearSubmission());
    const result = await dispatch(sendSibaSubmissionAsync({ propertyId, reservationData: reservation }));
    
    if (result.payload?.success && result.payload?.submissionId) {
      onSibaSent?.(result.payload.submissionId);
      setShowSubmission(true);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'amber': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'red': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'border-green-200 bg-green-50';
      case 'amber': return 'border-yellow-200 bg-yellow-50';
      case 'red': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* SIBA Manager Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SIBA Manager Tools</h3>
            <p className="text-sm text-gray-600">Validate and send SIBA submission for this reservation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Property ID: {propertyId}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleValidate}
          disabled={validation.isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {validation.isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <FileCheck className="h-4 w-4" />
          )}
          <span>{validation.isLoading ? 'Validating...' : 'Validate SIBA'}</span>
        </button>

        <button
          onClick={handleSendSiba}
          disabled={submission.isLoading || !validation.result?.isValid}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submission.isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>{submission.isLoading ? 'Sending...' : 'Send SIBA'}</span>
        </button>
      </div>

      {/* Validation Results */}
      {showValidation && validation.result && (
        <div className={`p-4 rounded-xl border-2 ${getStatusColor(validation.result.isValid ? 'green' : 'red')}`}>
          <div className="flex items-center space-x-3 mb-3">
            {getStatusIcon(validation.result.isValid ? 'green' : 'red')}
            <h4 className="text-lg font-semibold text-gray-900">
              Validation {validation.result.isValid ? 'Successful' : 'Failed'}
            </h4>
          </div>

          {validation.result.errors.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-red-800 mb-2">Errors:</h5>
              <ul className="list-disc list-inside space-y-1">
                {validation.result.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.result.warnings.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-blue-800 mb-2">Information:</h5>
              <ul className="list-disc list-inside space-y-1">
                {validation.result.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    {warning.includes('not found in') || warning.includes('unavailable') || warning.includes('No reservation code')
                      ? 'This reservation requires manual processing. SIBA submission will be recorded locally.'
                      : sanitizeUserErrorMessage(warning)
                    }
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.result.isValid && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h5 className="text-sm font-medium text-green-800">Ready for SIBA Submission</h5>
              </div>
              <p className="text-sm text-green-700">
                All required information is valid. You can proceed with SIBA submission.
              </p>
            </div>
          )}

          {validation.result.isValid && validation.result.validationData && (
            <div className="bg-white/50 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-gray-800 mb-2">Validation Data:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Guest Count:</span> {validation.result.validationData.guestCount}</div>
                <div><span className="font-medium">Nights:</span> {validation.result.validationData.nights}</div>
                <div><span className="font-medium">Check-in:</span> {new Date(validation.result.validationData.checkIn).toLocaleDateString()}</div>
                <div><span className="font-medium">Check-out:</span> {new Date(validation.result.validationData.checkOut).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submission Results */}
      {showSubmission && submission.result && (
        <div className={`p-4 rounded-xl border-2 ${getStatusColor(submission.result.success ? 'green' : 'red')}`}>
          <div className="flex items-center space-x-3 mb-3">
            {getStatusIcon(submission.result.success ? 'green' : 'red')}
            <h4 className="text-lg font-semibold text-gray-900">
              SIBA Submission {submission.result.success ? 'Successful' : 'Failed'}
            </h4>
          </div>

          {submission.result.success ? (
            <div className="space-y-2">
              <p className="text-sm text-green-700">
                <span className="font-medium">Submission ID:</span> {submission.result.submissionId}
              </p>
              <p className="text-sm text-green-700">
                SIBA submission has been successfully sent to the municipal authorities.
              </p>
            </div>
          ) : (
            <div>
              <h5 className="text-sm font-medium text-red-800 mb-2">Submission Errors:</h5>
              <ul className="list-disc list-inside space-y-1">
                {submission.result.errors?.map((error: string, index: number) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Messages */}
      {validation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{sanitizeUserErrorMessage(validation.error)}</p>
        </div>
      )}

      {submission.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{sanitizeUserErrorMessage(submission.error)}</p>
        </div>
      )}
    </div>
  );
};

export default SibaManagerTools;
