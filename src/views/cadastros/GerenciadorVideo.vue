<template>
    <!-- Container principal da página de gerenciamento de vídeos -->
    <div class="card vh">
        <h3 class="mt-6 mb-4">{{$t('gerenciamento_de_videos')}}</h3>
        <hr/>
        <!-- Exibe mensagem de erro caso haja algum problema -->
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <div v-else>
            <!-- Se for a primeira configuração, exibe o componente de configuração inicial -->
            <ConfigInitial v-if="isFirstSetup" : List="Lista S" @setup-concluido="handleSetupCompleted" />
            <!-- Caso contrário, exibe o componente de upload regular de vídeos -->
            <RegularUpload v-else : List="Lista S" @update-video="handleVideoUpdate" />
        </div>
        <!-- Exibe um spinner de carregamento enquanto os dados estão sendo processados -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<script setup>
/**
 * Importações de bibliotecas e componentes necessários para o funcionamento do componente.
 */

// Importa hooks do Vue para gerenciamento de estado e ciclo de vida
import { reactive, ref, onMounted, watch, computed, nextTick } from 'vue'; 

// Instância do axios para realizar requisições HTTP
import axios from '@/axios.js'; 

// Componente para configuração inicial de vídeos
import ConfigInitial from '@/components/PrimeiraConfiVideo.vue'; 

// Componente para uploads regulares de vídeos
import RegularUpload from '@/components/VideoUpload.vue'; 

// Componente de spinner de carregamento, exibido enquanto os dados estão sendo carregados
import LoadingSpinner from '@/components/LoadingSpinner.vue'; 

// Hook do PrimeVue para exibição de mensagens de sucesso ou erro (toast)
import { useToast } from 'primevue/usetoast'; 

// Store para gerenciamento da autenticação do usuário
import { useAuthStore } from '@/store/authStore.js'; 

import  Service from '@/services/ Service'; // Serviço para manipulação de dados

/**
 * Instâncias das stores e variáveis reativas para gerenciamento de estado.
 */

// Instância da store de autenticação para acessar informações do usuário
const store = useAuthStore(); 

// Instância do toast para exibir mensagens ao usuário
const toast = useToast(); 

// Variável reativa que controla o estado de carregamento
const loading = ref(true); 

// Variável reativa que armazena mensagens de erro
const errorMessage = ref(''); 

// Variável reativa que indica se é a primeira configuração do sistema
const isFirstSetup = ref(false); 

// Lista de  s (Documentos de Mídia) carregados da API
const Lista S = ref([]);

/**
 * Função que retorna se o usuário tem o papel de 'A inistrador'.
 * @returns {boolean} Retorna verdadeiro se o usuário for 'A inistrador', caso contrário falso.
 */
const a in = () => {
    return store.userRole === 'A inistrador'; 
};

/**
 * Função que lida com a atualização de vídeo no  .
 * Atualiza o vídeo associado ao   na lista de  s.
 * @param {Object} param - Parâmetro contendo o ID do   e o vídeo a ser atualizado.
 * @param {number} param. Id - ID do   (Documento de Mídia) a ser atualizado.
 * @param {string} param.video - URL ou identificador do novo vídeo a ser associado ao  .
 */
const handleVideoUpdate = async ({  Id, video }) => {
    // Busca o   correspondente ao ID na lista de  s
    const   = Lista S.value.find((item) => item.ID_  ===  Id); 
    if ( ) {
        // Atualiza o vídeo associado ao  
         .Video = video; 
    }
    
    // Recarrega a lista de  s após a atualização
    await fetch S();
};

/**
 * Função chamada quando a configuração inicial for concluída.
 * Altera o estado de "isFirstSetup" para falso e recarrega os  s.
 */
const handleSetupCompleted = () => {
    // Marca que a configuração inicial foi concluída
    isFirstSetup.value = false; 

    // Recarrega os  s
    fetch S();
};

/**
 * Função para carregar a lista de  s (Documentos de Mídia) a partir da API.
 * Realiza uma requisição HTTP para buscar os  s, considerando se o usuário é a inistrador ou não.
 */
const fetch S = async () => {
    // Inicia o estado de carregamento
    loading.value = true; 

    // Condicional para verificar se o usuário é a inistrador ou não
    const data = a in() ? {} : { id_cliente: store.userIdCliente };

    try {
        // Realiza a requisição para buscar os  s
        const response = await  Service.listar s(data); 
        Lista S.value = response.data; // Armazena os  s na variável reativa Lista S

        // Se todos os  s tiverem vídeo 'N', marca que é a primeira configuração
        isFirstSetup.value = Lista S.value.every(( ) =>  .Video === 'N'); 
    } catch (error) {
        // Exibe uma mensagem de erro caso ocorra falha na requisição
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao carregar  s', 
            life: 3000 
        });

        // Loga o erro no console para depuração
        console.error('Erro ao carregar  s:', error); 
    } finally {
        // Finaliza o estado de carregamento
        loading.value = false; 
    }
};

/**
 * Hook do Vue que é executado quando o componente é montado.
 * Carrega a lista de  s ao inicializar o componente.
 */
onMounted(fetch S);

</script>

<style scoped>
/**
 * Estilo para a classe de mensagem de erro.
 * Utiliza a cor vermelha e negrito para destacar a mensagem de erro.
 */
.error {
    color: red;
    font-weight: bold;
}
</style>
