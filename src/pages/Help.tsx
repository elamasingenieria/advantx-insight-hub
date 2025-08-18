import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Bot,
  User,
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export default function Help() {
  const { user, profile } = useAuth();
  const [conversationId] = useState(() => {
    // Generate unique conversation ID when component mounts
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! 👋 Soy el asistente de AdvantX. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const sendToWebhook = async (message: string) => {
    try {
      const webhookUrl = 'https://devwebhookn8n.ezequiellamas.com/webhook/97b7304f-badd-4689-87d8-cbf983144850';
      
      const payload = {
        conversationId: conversationId,
        message: message,
        userId: user?.id,
        userEmail: user?.email,
        userProfile: {
          id: profile?.id,
          fullName: profile?.full_name,
          role: profile?.role,
        },
        timestamp: new Date().toISOString(),
      };

      console.log('Sending to webhook:', { url: webhookUrl, payload });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      // Get the response text from webhook
      const responseText = await response.text();
      console.log('Webhook response received:', responseText);

      // Try to parse JSON response
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('Parsed webhook response:', jsonResponse);
        
        // Extract output field from response
        if (Array.isArray(jsonResponse) && jsonResponse.length > 0 && jsonResponse[0].output) {
          return { success: true, message: jsonResponse[0].output };
        } else if (jsonResponse.output) {
          return { success: true, message: jsonResponse.output };
        } else {
          console.warn('No output field found in webhook response:', jsonResponse);
          return { success: false, message: 'No se recibió una respuesta válida del webhook.' };
        }
      } catch (parseError) {
        console.error('Error parsing webhook response JSON:', parseError);
        // If it's not JSON, use the raw text as response
        return { success: true, message: responseText };
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      return { success: false, message: 'Error al conectar con el webhook.' };
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isSending) return;

    const userMessage: Message = {
      id: generateMessageId(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);
    setIsTyping(true);

    try {
      // Send message to n8n webhook and get response
      const webhookResponse = await sendToWebhook(content);
      
      // Update user message status based on webhook result
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: webhookResponse.success ? 'sent' : 'error' }
            : msg
        )
      );

      // Use webhook response or fallback to local response
      let botResponseContent: string;
      
      if (webhookResponse.success && webhookResponse.message) {
        botResponseContent = webhookResponse.message;
        console.log('Using webhook response:', botResponseContent);
      } else {
        console.warn('Webhook failed or no message, using fallback response');
        botResponseContent = getBotResponse(content);
      }

      // Add bot response message
      const botResponse: Message = {
        id: generateMessageId(),
        content: botResponseContent,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      setIsSending(false);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update user message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' }
            : msg
        )
      );

      // Add error message
      const errorMessage: Message = {
        id: generateMessageId(),
        content: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('proyecto') || message.includes('project')) {
      return 'Puedo ayudarte con la gestión de proyectos. Puedes crear nuevos proyectos, agregar fases y tareas, y hacer seguimiento del progreso. ¿Qué específicamente necesitas saber sobre los proyectos?';
    }
    
    if (message.includes('roi') || message.includes('retorno')) {
      return 'El ROI (Retorno de Inversión) se calcula automáticamente basado en los ahorros mensuales y el costo total del proyecto. Puedes ver análisis detallados en el dashboard. ¿Te gustaría saber más sobre cómo interpretarlo?';
    }
    
    if (message.includes('tarea') || message.includes('task')) {
      return 'Las tareas se organizan dentro de las fases del proyecto. Puedes asignar tareas a miembros del equipo, establecer fechas límite y hacer seguimiento del progreso. ¿Necesitas ayuda con algo específico sobre las tareas?';
    }
    
    if (message.includes('usuario') || message.includes('user') || message.includes('equipo')) {
      return 'Los usuarios pueden tener diferentes roles: Cliente, Miembro del Equipo, o Administrador. Cada rol tiene diferentes permisos y accesos. ¿Qué quieres saber sobre la gestión de usuarios?';
    }
    
    if (message.includes('hola') || message.includes('hello') || message.includes('hi')) {
      return '¡Hola! Estoy aquí para ayudarte con cualquier pregunta sobre AdvantX. Puedo asistirte con proyectos, tareas, usuarios, ROI y más. ¿En qué puedo ayudarte?';
    }
    
    return 'Gracias por tu pregunta. Actualmente estoy en desarrollo y pronto podré brindarte respuestas más específicas. Para soporte inmediato, puedes contactar al equipo de AdvantX. ¿Hay algo más en lo que pueda intentar ayudarte?';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Centro de Ayuda</h1>
                  <p className="text-sm text-muted-foreground">Asistente AdvantX</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://clientes.advantx.co/help', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ayuda Externa
              </Button>
              {profile && (
                <div className="text-right">
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <Badge variant="outline" className="text-xs">
                    {profile.role.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          
          {/* Sidebar with Quick Help */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temas Populares</CardTitle>
                <CardDescription>Preguntas frecuentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-auto p-3"
                  onClick={() => sendMessage('¿Cómo creo un nuevo proyecto?')}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">Crear Proyectos</div>
                    <div className="text-xs text-muted-foreground">Guía paso a paso</div>
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-auto p-3"
                  onClick={() => sendMessage('¿Cómo funciona el cálculo de ROI?')}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">Cálculo ROI</div>
                    <div className="text-xs text-muted-foreground">Métricas financieras</div>
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-auto p-3"
                  onClick={() => sendMessage('¿Cómo asigno tareas al equipo?')}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">Gestión de Tareas</div>
                    <div className="text-xs text-muted-foreground">Asignaciones y seguimiento</div>
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-auto p-3"
                  onClick={() => sendMessage('¿Qué permisos tiene cada rol de usuario?')}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">Roles y Permisos</div>
                    <div className="text-xs text-muted-foreground">Gestión de usuarios</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estado del Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    Asistente disponible
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">
                      Webhook n8n integrado
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ID de conversación: <code className="text-xs bg-muted px-1 rounded">{conversationId}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Asistente AdvantX</CardTitle>
                    <CardDescription>
                      Pregúntame sobre proyectos, tareas, ROI y más
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              {/* Messages Area */}
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 px-6 py-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.sender === 'user' && message.status && (
                              <div className="text-xs opacity-70">
                                {message.status === 'sending' && <Loader2 className="w-3 h-3 animate-spin" />}
                                {message.status === 'sent' && '✓'}
                                {message.status === 'error' && '✗'}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
                
                {/* Message Input */}
                <div className="border-t p-4 flex-shrink-0">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu pregunta aquí..."
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!inputMessage.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Presiona Enter para enviar • Shift+Enter para nueva línea
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
