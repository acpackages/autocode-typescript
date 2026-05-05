export type EventHandler = ({ data, callback }: { data?: any; callback?: ({ response }: { response?: any }) => void }) => void;
export type AnyEventHandler = ({ event, data, callback }: { event: string; data?: any; callback?: ({ response }: { response?: any }) => void }) => void;

export type MessageInterceptor = ({ message, callback, abort }: {
  message: any;
  callback?: ({ response }: { response?: any }) => void;
  abort?: () => void;
}) => Promise<void> | void;

export interface AcWebSocketOptions {
  id: string;
  nsp?: string;
  handshake?: Record<string, any>;
  server?: any;
}
