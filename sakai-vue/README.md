# Sakai Vue Project

Este projeto é uma aplicação Vue.js que fornece uma interface para monitoramento em tempo real. Abaixo estão os detalhes sobre a estrutura do projeto e suas funcionalidades.

## Estrutura do Projeto

- **src/assets**: Contém arquivos de mídia e outros recursos estáticos utilizados no projeto.
  
- **src/components**: Contém componentes Vue reutilizáveis que são utilizados nas diferentes partes da aplicação.
  
- **src/views/Dashboard.vue**: Componente Vue que representa a visualização do dashboard. Ele gerencia dados em tempo real através de sockets e exibe widgets de status, notificações e logs.
  
- **src/App.vue**: Componente raiz da aplicação Vue, que serve como um contêiner para outros componentes e define a estrutura básica da aplicação.
  
- **src/main.js**: Ponto de entrada da aplicação. Inicializa a instância do Vue e monta a aplicação no DOM.
  
- **.vscode/launch.json**: Configuração de lançamento para depuração da aplicação, definindo como o ambiente de desenvolvimento deve iniciar a aplicação.
  
- **package.json**: Configuração do npm, listando as dependências do projeto, scripts e outras configurações necessárias.
  
- **tsconfig.json**: Configuração do TypeScript, especificando as opções do compilador e os arquivos a serem incluídos na compilação.

## Instalação

Para instalar as dependências do projeto, execute:

```
npm install
```

## Execução

Para iniciar a aplicação em modo de desenvolvimento, use:

```
npm run serve
```

A aplicação estará disponível em `http://localhost:8080`.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir um pull request ou relatar problemas.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.