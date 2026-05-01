import type {
  EasyAuthFundingOrder,
  EasyAuthSession,
  EasyAuthWallet
} from "@easyauth/shared";

export interface EasyAuthEventMap {
  session: EasyAuthSession | null;
  wallet: EasyAuthWallet | null;
  funding: EasyAuthFundingOrder;
  error: unknown;
}

export type EasyAuthEventName = keyof EasyAuthEventMap;

export type EasyAuthEventHandler<TEventName extends EasyAuthEventName> = (
  payload: EasyAuthEventMap[TEventName]
) => void;

export interface EasyAuthEventBus {
  emit<TEventName extends EasyAuthEventName>(
    eventName: TEventName,
    payload: EasyAuthEventMap[TEventName]
  ): void;
  on<TEventName extends EasyAuthEventName>(
    eventName: TEventName,
    handler: EasyAuthEventHandler<TEventName>
  ): () => void;
}

export function createEasyAuthEventBus(): EasyAuthEventBus {
  const handlers = new Map<EasyAuthEventName, Set<(payload: unknown) => void>>();

  return {
    emit(eventName, payload) {
      handlers.get(eventName)?.forEach((handler) => handler(payload));
    },
    on(eventName, handler) {
      const eventHandlers = handlers.get(eventName) ?? new Set();
      eventHandlers.add(handler as (payload: unknown) => void);
      handlers.set(eventName, eventHandlers);

      return () => {
        eventHandlers.delete(handler as (payload: unknown) => void);
      };
    }
  };
}
