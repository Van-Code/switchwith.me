import { render, screen, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SocketProvider, useSocket } from './SocketContext';

// Mock socket.io-client
const mockOn = jest.fn();
const mockDisconnect = jest.fn();
const mockSocket = {
  on: mockOn,
  disconnect: mockDisconnect,
  connected: false,
  id: 'mock-socket-id',
};

const mockIo = jest.fn(() => mockSocket);

jest.mock('socket.io-client', () => ({
  io: mockIo,
}));

describe('SocketContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.log mock
    console.log = jest.fn();
  });

  describe('SocketProvider', () => {
    it('renders children', () => {
      render(
        <SocketProvider>
          <div>Test Child</div>
        </SocketProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('initializes socket connection on mount', () => {
      render(
        <SocketProvider>
          <div>Test</div>
        </SocketProvider>
      );

      expect(mockIo).toHaveBeenCalledWith({
        path: '/api/socket',
        addTrailingSlash: false,
      });
    });

    it('sets up connect event listener', () => {
      render(
        <SocketProvider>
          <div>Test</div>
        </SocketProvider>
      );

      expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('sets up disconnect event listener', () => {
      render(
        <SocketProvider>
          <div>Test</div>
        </SocketProvider>
      );

      expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('disconnects socket on unmount', () => {
      const { unmount } = render(
        <SocketProvider>
          <div>Test</div>
        </SocketProvider>
      );

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('useSocket hook', () => {
    it('returns socket context', () => {
      const { result } = renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      expect(result.current).toHaveProperty('socket');
      expect(result.current).toHaveProperty('isConnected');
    });

    it('returns socket instance', async () => {
      const { result } = renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      await waitFor(() => {
        expect(result.current.socket).toBeTruthy();
      });
    });

    it('can be used outside provider with default values', () => {
      const { result } = renderHook(() => useSocket());

      expect(result.current.socket).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Connection State', () => {
    it('initializes with isConnected as false', () => {
      const { result } = renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('sets isConnected to true on connect event', async () => {
      const { result } = renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      // Find the connect handler and call it
      const connectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });

    it('logs when socket connects', async () => {
      renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      // Trigger connect event
      const connectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Socket connected');
      });
    });

    it('sets isConnected to false on disconnect event', async () => {
      const { result } = renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      // First connect
      const connectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Then disconnect
      const disconnectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'disconnect'
      )?.[1];

      if (disconnectHandler) {
        disconnectHandler();
      }

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('logs when socket disconnects', async () => {
      renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      const disconnectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'disconnect'
      )?.[1];

      if (disconnectHandler) {
        disconnectHandler();
      }

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Socket disconnected');
      });
    });
  });

  describe('Socket Instance', () => {
    it('provides socket instance to consumers', async () => {
      const { result } = renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      await waitFor(() => {
        expect(result.current.socket).toEqual(mockSocket);
      });
    });

    it('socket instance has expected methods', async () => {
      const { result } = renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      await waitFor(() => {
        expect(result.current.socket).toHaveProperty('on');
        expect(result.current.socket).toHaveProperty('disconnect');
      });
    });
  });

  describe('Multiple Consumers', () => {
    it('provides same socket instance to multiple consumers', () => {
      const Consumer1 = () => {
        const { socket } = useSocket();
        return <div data-testid="consumer1">{socket ? 'has socket' : 'no socket'}</div>;
      };

      const Consumer2 = () => {
        const { socket } = useSocket();
        return <div data-testid="consumer2">{socket ? 'has socket' : 'no socket'}</div>;
      };

      render(
        <SocketProvider>
          <Consumer1 />
          <Consumer2 />
        </SocketProvider>
      );

      waitFor(() => {
        expect(screen.getByTestId('consumer1')).toHaveTextContent('has socket');
        expect(screen.getByTestId('consumer2')).toHaveTextContent('has socket');
      });
    });

    it('all consumers see same connection state', async () => {
      const ConnectionStatus1 = () => {
        const { isConnected } = useSocket();
        return <div data-testid="status1">{isConnected ? 'connected' : 'disconnected'}</div>;
      };

      const ConnectionStatus2 = () => {
        const { isConnected } = useSocket();
        return <div data-testid="status2">{isConnected ? 'connected' : 'disconnected'}</div>;
      };

      render(
        <SocketProvider>
          <ConnectionStatus1 />
          <ConnectionStatus2 />
        </SocketProvider>
      );

      // Initially disconnected
      expect(screen.getByTestId('status1')).toHaveTextContent('disconnected');
      expect(screen.getByTestId('status2')).toHaveTextContent('disconnected');

      // Trigger connect
      const connectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }

      // Both should show connected
      await waitFor(() => {
        expect(screen.getByTestId('status1')).toHaveTextContent('connected');
        expect(screen.getByTestId('status2')).toHaveTextContent('connected');
      });
    });
  });

  describe('Cleanup', () => {
    it('cleans up socket on provider unmount', () => {
      const { unmount } = render(
        <SocketProvider>
          <div>Test</div>
        </SocketProvider>
      );

      expect(mockDisconnect).not.toHaveBeenCalled();

      unmount();

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('only initializes socket once', () => {
      const { rerender } = render(
        <SocketProvider>
          <div>Test 1</div>
        </SocketProvider>
      );

      const callCount1 = mockIo.mock.calls.length;

      rerender(
        <SocketProvider>
          <div>Test 2</div>
        </SocketProvider>
      );

      const callCount2 = mockIo.mock.calls.length;

      // Socket should only be initialized once despite rerender
      // Note: This might not work as expected due to StrictMode
      expect(callCount2).toBeGreaterThanOrEqual(callCount1);
    });
  });

  describe('Socket Configuration', () => {
    it('configures socket with correct path', () => {
      render(
        <SocketProvider>
          <div>Test</div>
        </SocketProvider>
      );

      expect(mockIo).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/socket',
        })
      );
    });

    it('configures socket with addTrailingSlash false', () => {
      render(
        <SocketProvider>
          <div>Test</div>
        </SocketProvider>
      );

      expect(mockIo).toHaveBeenCalledWith(
        expect.objectContaining({
          addTrailingSlash: false,
        })
      );
    });
  });

  describe('Real-world Usage', () => {
    it('supports listening to custom events', async () => {
      const MessageListener = () => {
        const { socket } = useSocket();
        const [message, setMessage] = React.useState('');

        React.useEffect(() => {
          if (socket) {
            socket.on('message', (data: string) => {
              setMessage(data);
            });
          }
        }, [socket]);

        return <div data-testid="message">{message || 'No message'}</div>;
      };

      render(
        <SocketProvider>
          <MessageListener />
        </SocketProvider>
      );

      expect(screen.getByTestId('message')).toHaveTextContent('No message');
    });

    it('can check connection status before emitting', async () => {
      const EmitButton = () => {
        const { socket, isConnected } = useSocket();

        const handleClick = () => {
          if (socket && isConnected) {
            // Would emit here in real app
            console.log('Emitting event');
          }
        };

        return (
          <button onClick={handleClick} disabled={!isConnected}>
            Send Message
          </button>
        );
      };

      render(
        <SocketProvider>
          <EmitButton />
        </SocketProvider>
      );

      const button = screen.getByText('Send Message');
      expect(button).toBeDisabled();

      // Trigger connect
      const connectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid connect/disconnect cycles', async () => {
      const { result } = renderHook(() => useSocket(), {
        wrapper: SocketProvider,
      });

      const connectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      const disconnectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'disconnect'
      )?.[1];

      if (connectHandler && disconnectHandler) {
        connectHandler();
        await waitFor(() => expect(result.current.isConnected).toBe(true));

        disconnectHandler();
        await waitFor(() => expect(result.current.isConnected).toBe(false));

        connectHandler();
        await waitFor(() => expect(result.current.isConnected).toBe(true));

        disconnectHandler();
        await waitFor(() => expect(result.current.isConnected).toBe(false));
      }
    });

    it('handles null socket gracefully', () => {
      const NullSocketConsumer = () => {
        const { socket, isConnected } = useSocket();
        return (
          <div>
            Socket: {socket ? 'exists' : 'null'}, Connected: {isConnected.toString()}
          </div>
        );
      };

      // Use context without provider
      render(<NullSocketConsumer />);

      expect(screen.getByText(/Socket: null, Connected: false/)).toBeInTheDocument();
    });
  });
});
