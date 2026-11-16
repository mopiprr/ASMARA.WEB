import type { ProcurementTicket } from '../../types/procurement.types';

import {
  DESCRIPTION_MAX_LENGTH,
  SUBJECT_MAX_LENGTH,
} from '../../utils/procurementDetail.utils';

import { detailInputClass } from './detailStyles';

interface RequestInfoSectionProps {
  ticket: ProcurementTicket;

  isEditing: boolean;
  isProcessing: boolean;

  subject: string;
  description: string;
  onSubjectChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

function RequestInfoSection({
  ticket,
  isEditing,
  isProcessing,
  subject,
  description,
  onSubjectChange,
  onDescriptionChange,
}: RequestInfoSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          Request Information
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-slate-400">
            Request Subject
          </label>

          {isEditing ? (
            <input
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
              maxLength={SUBJECT_MAX_LENGTH}
              disabled={isProcessing}
              className={detailInputClass}
              placeholder="Enter request subject"
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800">
              {ticket.subject}
            </p>
          )}

          {isEditing && (
            <p className="mt-1 text-right text-xs text-slate-400">
              {subject.length}/{SUBJECT_MAX_LENGTH}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-400">Requester</p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {ticket.employeeName || '-'}
            {ticket.requesterDepartment && (
              <span className="ml-1 text-xs font-normal text-slate-500">
                ({ticket.requesterDepartment})
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Current Step</p>

          <p className="mt-1 text-sm font-semibold text-blue-600">
            {ticket.currentStep || '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Created At</p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {new Date(ticket.createdAt).toLocaleString('id-ID')}
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-slate-400">
            Description
          </label>

          {isEditing ? (
            <>
              <textarea
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                maxLength={DESCRIPTION_MAX_LENGTH}
                rows={4}
                disabled={isProcessing}
                className={detailInputClass}
                placeholder="Enter request description"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </p>
            </>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {ticket.description || '-'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default RequestInfoSection;