
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Search, Send, Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";

// Mock data for messages
const messages = [
  {
    id: 1,
    client: "Carlos Silva",
    lastMessage: "Olá, posso remarcar meu horário de amanhã?",
    time: "10:30",
    date: "04/04/2023",
    unread: true,
    conversation: [
      { id: 1, sender: "client", message: "Olá, posso remarcar meu horário de amanhã?", time: "10:30" },
    ]
  },
  {
    id: 2,
    client: "Roberto Almeida",
    lastMessage: "Confirmado para quinta-feira às 15h. Obrigado!",
    time: "09:45",
    date: "04/04/2023",
    unread: false,
    conversation: [
      { id: 1, sender: "barber", message: "Olá Roberto, confirmando seu agendamento para quinta-feira às 15h.", time: "09:30" },
      { id: 2, sender: "client", message: "Confirmado para quinta-feira às 15h. Obrigado!", time: "09:45" },
    ]
  },
  {
    id: 3,
    client: "Lucas Mendes",
    lastMessage: "Vocês têm horário disponível para o próximo sábado?",
    time: "Ontem",
    date: "03/04/2023",
    unread: true,
    conversation: [
      { id: 1, sender: "client", message: "Vocês têm horário disponível para o próximo sábado?", time: "14:20" },
    ]
  },
  {
    id: 4,
    client: "Fernando Costa",
    lastMessage: "Preciso cancelar meu horário de hoje, desculpa.",
    time: "Ontem",
    date: "03/04/2023",
    unread: false,
    conversation: [
      { id: 1, sender: "client", message: "Preciso cancelar meu horário de hoje, desculpa.", time: "08:15" },
      { id: 2, sender: "barber", message: "Sem problemas Fernando, vamos remarcar para quando for melhor para você.", time: "08:30" },
    ]
  },
  {
    id: 5,
    client: "André Santos",
    lastMessage: "Obrigado pelo excelente serviço! Voltarei em breve.",
    time: "02/04",
    date: "02/04/2023",
    unread: false,
    conversation: [
      { id: 1, sender: "client", message: "Obrigado pelo excelente serviço! Voltarei em breve.", time: "18:45" },
      { id: 2, sender: "barber", message: "Ficamos felizes em atendê-lo, André! Até a próxima.", time: "19:00" },
    ]
  }
];

// Template messages
const templates = [
  {
    id: 1,
    title: "Confirmação de Agendamento",
    message: "Olá [NOME], confirmando seu agendamento para [DATA] às [HORA] com o profissional [BARBEIRO]. Agradecemos a preferência!"
  },
  {
    id: 2,
    title: "Lembrete de Agendamento",
    message: "Olá [NOME], lembrete do seu horário amanhã às [HORA] na BARBZ. Caso precise reagendar, entre em contato conosco. Aguardamos você!"
  },
  {
    id: 3,
    title: "Agradecimento após visita",
    message: "Olá [NOME], obrigado pela visita à BARBZ hoje! Esperamos que tenha gostado do serviço. Sua opinião é muito importante para nós."
  },
  {
    id: 4,
    title: "Aniversário",
    message: "Parabéns [NOME]! Desejamos um feliz aniversário e um dia especial. Como presente, oferecemos 10% de desconto no seu próximo serviço."
  },
  {
    id: 5,
    title: "Desconto fidelidade",
    message: "Olá [NOME], você acaba de ganhar um desconto de 15% por ser um cliente fiel da BARBZ! Válido para seu próximo agendamento."
  }
];

export default function Mensagens() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  const filteredMessages = messages.filter(message => 
    message.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const unreadMessages = filteredMessages.filter(message => message.unread);
  const readMessages = filteredMessages.filter(message => !message.unread);
  
  const selectedChatData = messages.find(message => message.id === selectedChat);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    // In a real app, you would update the messages array and send the message to the backend
    alert(`Enviando mensagem para ${selectedChatData?.client}: ${newMessage}`);
    setNewMessage("");
  };

  const handleSelectChat = (id: number) => {
    setSelectedChat(id);
    // In a real app, you would mark the message as read in the backend
  };
  
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="header-text">Mensagens</h1>
          <Button className="btn-primary gap-2">
            <Plus size={16} />
            Nova Mensagem
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {/* Messages List */}
          <Card className="barber-card md:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Conversas</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <RefreshCcw size={16} />
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar conversa..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="pb-0">
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="unread">Não lidas 
                    {unreadMessages.length > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-barber-gold rounded-full text-white">
                        {unreadMessages.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pb-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhuma mensagem encontrada.</p>
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div 
                        key={message.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedChat === message.id 
                            ? 'bg-secondary' 
                            : message.unread 
                            ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' 
                            : 'hover:bg-secondary/50'
                        }`}
                        onClick={() => handleSelectChat(message.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-barber flex items-center justify-center text-white">
                              {message.client.split(' ').map(name => name[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium flex items-center">
                                {message.client}
                                {message.unread && (
                                  <span className="ml-2 h-2 w-2 rounded-full bg-barber-gold"></span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground truncate max-w-[160px]">
                                {message.lastMessage}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {message.time}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="unread" className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pb-4">
                  {unreadMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhuma mensagem não lida.</p>
                    </div>
                  ) : (
                    unreadMessages.map((message) => (
                      <div 
                        key={message.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedChat === message.id 
                            ? 'bg-secondary' 
                            : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                        }`}
                        onClick={() => handleSelectChat(message.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-barber flex items-center justify-center text-white">
                              {message.client.split(' ').map(name => name[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium flex items-center">
                                {message.client}
                                <span className="ml-2 h-2 w-2 rounded-full bg-barber-gold"></span>
                              </div>
                              <div className="text-sm text-muted-foreground truncate max-w-[160px]">
                                {message.lastMessage}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {message.time}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Chat Window */}
          <Card className="barber-card md:col-span-2 flex flex-col">
            {!selectedChatData ? (
              <div className="flex items-center justify-center h-[500px] text-center">
                <div>
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-medium mb-2">Suas mensagens</h3>
                  <p className="text-muted-foreground">
                    Selecione uma conversa para ver as mensagens ou inicie uma nova conversa.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-barber flex items-center justify-center text-white">
                      {selectedChatData.client.split(' ').map(name => name[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-lg">{selectedChatData.client}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                  {selectedChatData.conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'client' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl ${
                          msg.sender === 'client'
                            ? 'bg-secondary text-foreground rounded-tl-none'
                            : 'bg-primary text-primary-foreground rounded-tr-none'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <div className={`text-xs mt-1 ${
                          msg.sender === 'client' ? 'text-muted-foreground' : 'text-primary-foreground/80'
                        }`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                
                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Digite sua mensagem..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} className="btn-primary">
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
        
        {/* Template Messages */}
        <div className="mt-6">
          <Card className="barber-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Modelos de Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className="border rounded-md p-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium mb-2">{template.title}</h4>
                    <p className="text-sm text-muted-foreground">{template.message}</p>
                    <div className="mt-2 flex justify-end">
                      <Button variant="outline" size="sm">
                        Usar modelo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
