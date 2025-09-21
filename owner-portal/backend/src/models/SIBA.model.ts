// services/siba.service.ts

interface SibaLog {
  reservationId: number;
  propertyId: number;
  status: "success" | "fail";
  message: string;
  timestamp: Date;
}

const sibaLogs: SibaLog[] = []; // later move to DB

export const validateSibaService = async (reservationId: number) => {
  // fake validation
  const isValid = reservationId % 2 === 0;
  return { reservationId, valid: isValid };
};

export const sendSibaService = async (reservationId: number, propertyId: number) => {
  try {
    // simulate API call
    const success = Math.random() > 0.2;

    const log: SibaLog = {
      reservationId,
      propertyId,
      status: success ? "success" : "fail",
      message: success ? "SIBA sent successfully" : "SIBA failed",
      timestamp: new Date(),
    };
    sibaLogs.push(log);

    return log;
  } catch (err) {
    throw new Error("Error sending SIBA");
  }
};

export const bulkSibaStatusService = async (propertyIds: number[]) => {
  return Promise.all(propertyIds.map(pid => getSibaStatusService(pid)));
};

export const getSibaLogsService = async (reservationId: number) => {
  return sibaLogs.filter(l => l.reservationId === reservationId);
};
