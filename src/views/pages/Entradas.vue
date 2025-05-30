<script setup>
/**
 * Importações necessárias para o funcionamento do componente.
 * 
 * @module
 */

// Importa as funções reativas do Vue, como 'ref', 'reactive' e 'onMounted'.
import { ref, reactive, onMounted } from 'vue'; // Usado para gerenciar o estado reativo e os hooks de ciclo de vida.

// Importa o componente de carregamento personalizado.
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Exibe um spinner durante o carregamento de dados.

// Importa a loja de autenticação, que contém as informações do usuário e do cliente.
import { useAuthStore } from '@/store/authStore.js'; // Permite acessar o estado de autenticação do usuário e cliente.

// Importa o sistema de toast para notificações do PrimeVue.
import { useToast } from 'primevue/usetoast'; // Sistema de notificações (toast) para exibir mensagens ao usuário.

import  Service from '@/services/ Service'; // Serviço para manipulação de dados
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const toast = useToast(); // Instancia o sistema de toast para mostrar mensagens de sucesso, erro ou aviso ao usuário.

const store = useAuthStore(); // Acessa o store de autenticação para obter as informações do usuário e cliente logados.
const  Selecionada = ref(null); // Declara uma variável reativa para armazenar a   (unidade de dados) selecionada.
const loading = ref(false); // Declara uma variável reativa para controlar o estado de carregamento da página.
const Dados = ref([]); // Declara uma variável reativa para armazenar os dados recuperados da integração.
const validador = ref(false); // Declara uma variável booleana para validar se houve erro ou falha na integração.
const primeiraInteracao = ref(null); // Flag para identificar se é a primeira vez que o componente interage com os dados.


// Objeto reativo para armazenar as informações de integração.
const Integracao = reactive({
    ClienteID: '', // Armazena o ID do Cliente.
    UserID: '', // Armazena o ID do Usuário.
    URL: '', // Armazena a URL da API para integração.
    Chave: '', // Armazena a chave de autenticação para a integração.
    ChaveAPI: '' // Armazena a chave API necessária para a integração.
});

/**
 * Função para buscar os dados iniciais ao carregar o componente.
 * Faz uma requisição ao backend para recuperar as informações da  .
 */
const fetchDadosIniciais = async () => {
    loading.value = true; // Marca o estado de carregamento como verdadeiro.

    try {
        // Prepara os dados para enviar ao backend para buscar informações da  .
        const data = {
            id_cliente: store.userIdCliente, // Obtém o ID do Cliente do store de autenticação.
            id_usuario: store.userId // Obtém o ID do Usuário logado do store de autenticação.
        };

        // Envia uma requisição POST para buscar os dados da  .
        const response = await  Service.infoEntrada(data);

        primeiraInteracao.value = true; // Marca que a primeira interação foi realizada.
        Dados.value = response.data; // Armazena os dados recebidos da resposta na variável 'Dados'.
    } catch (error) {
        // Trata erros que ocorrem durante a requisição.
        if (error.response && error.response.status === 401) { // Verifica se o erro é 401 (não autorizado).
            validador.value = true; // Marca a falha na integração.
            console.warn('Erro de autenticação:', error.response?.data?.message); // Exibe um aviso no console.
            toast.add({
                severity: 'warn', // Exibe a notificação como aviso.
                summary: t('info'), // Título da notificação.
                detail:  t('entrada_fetch_ _default'), // Detalhes do erro, se disponíveis.
                life: 3000 // Duração da notificação.
            });
        } else {
            // Caso ocorra outro tipo de erro, exibe um erro no console.
            console.error('Erro ao carregar Itens:', error); // Loga o erro completo no console.
        }
    } finally {
        loading.value = false; // Finaliza o carregamento, independentemente do resultado da requisição.
    }
};

/**
 * Função para lidar com a troca da   selecionada.
 * Atualiza as informações de integração com base na   escolhida pelo usuário.
 */
const handle Change = () => {
    primeiraInteracao.value = false; // Marca que a interação com a   foi realizada.
    const selected  = Dados.value.find((c) => c.ID_  ===  Selecionada.value); // Encontra a   selecionada nos dados.

    if (selected ) {
        // Se a   for encontrada, atualiza as informações de integração.
        Integracao.UserID = selected .UserID; // Atualiza o ID do Usuário.
        Integracao.URL = selected .URL; // Atualiza a URL da API.
        Integracao.ClienteID = selected .ClienteID; // Atualiza o ID do Cliente.
        Integracao.Chave = selected .Chave; // Atualiza a chave de autenticação.
        Integracao.ChaveAPI = selected .ChaveAPI; // Atualiza a chave API.
    }
};

/**
 * Função para salvar as informações de integração no backend.
 * Envia os dados preenchidos pelo usuário para o backend.
 */
const salvarIntegracao = async () => {
    try {
        // Prepara os dados para serem enviados para o backend.
        let data = {
            id_cliente: store.userIdCliente, // ID do Cliente, obtido do store de autenticação.
            ID_ :  Selecionada.value, // ID da   selecionada.
            ClienteID: Integracao.ClienteID, // ID do Cliente preenchido.
            UserID: Integracao.UserID, // ID do Usuário preenchido.
            URL: Integracao.URL, // URL da API preenchida.
            Chave: Integracao.Chave, // Chave de autenticação preenchida.
            ChaveAPI: Integracao.ChaveAPI // Chave API preenchida.
        };

        loading.value = true; // Marca o estado de carregamento como verdadeiro enquanto a requisição é feita.

        // Envia uma requisição POST para salvar as informações da integração.
        const response = await  Service.atualizarInfo(data);

        // Se a resposta for de sucesso (status 200 ou 201), exibe uma notificação de sucesso.
        if (response.status === 200 || response.status === 201) {
            toast.add({
                severity: 'success', // Notificação de sucesso.
                summary: t('title_sucess'), // Título da notificação.
                detail: t('entrada_save_data_sucess'), // Detalhe da notificação.
                life: 3000 // Duração da notificação.
            });
        } else {
            // Se a resposta não for sucesso (status diferente de 200 ou 201), lança um erro.
            throw new Error('entrada_save_error');
        }
    } catch (error) {
        // Se ocorrer um erro durante a requisição, exibe uma notificação de erro.
        toast.add({
            severity: 'error', // Notificação de erro.
            summary: t('title_error'), // Título da notificação.
            detail: `${error.response?.data?.message || t('error.message')}`, // Detalhes do erro.
            life: 3000 // Duração da notificação.
        });

        console.error('Erro ao salvar dados de integração:', error); // Loga o erro no console para depuração.
    } finally {
        loading.value = false; // Finaliza o carregamento, independentemente do resultado da requisição.
    }
};

// Chama a função para buscar os dados assim que o componente é montado.
onMounted(() => {
    fetchDadosIniciais(); // Chama a função para buscar os dados da integração ao montar o componente.
});

</script>

<template>
    <div class="card">
        <h2 class="my-6 text-2xl">{{t('integration_configuration')}}</h2>

        <div class="justify-content-between align-items-baseline flex">
            <!-- Dropdown para selecionar a   -->
            <Dropdown
                :options="Dados"
                :virtualScrollerOptions="{ itemSize: 30 }"
                :filter="true"
                :filterBy="'Identificacao'"
                :disabled="validador"
                class="mb-5"
                v-model=" Selecionada"
                optionLabel="Identificacao"
                optionValue="ID_ "
                :placeholder="$t('select_machine')"
                @change="handle Change()"
            />
            <!-- Mensagem informativa caso não haja interação e validador não esteja ativo -->
            <InlineMessage class="inlinemessage " v-if="!validador && primeiraInteracao" severity="info">{{t('entrada_first')}}</InlineMessage>
        </div>

        <!-- Formulário para editar e salvar as configurações da integração -->

        <form @submit.prevent="salvarIntegracao">
            <div class="p-fluid grid">
                <div class="mt-4 lg:col-6 md:col-6 sm:col-12">
                    <label for="userid">{{t('userid_api')}}:</label>
                    <InputText class="my-2" id="userid" v-model="Integracao.UserID" type="text" :disabled="validador" />
                </div>
                <div class="mt-4 lg:col-6 md:col-6 sm:col-12">
                    <label for="senha">{{t('url_api')}}:</label>
                    <InputText class="my-2" id="senha" v-model="Integracao.URL" type="text" :disabled="validador" />
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="idcliente">{{t('idclient_api')}}:</label>
                    <InputText class="my-2" id="idcliente" v-model="Integracao.ClienteID" type="text" :disabled="validador" />
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="chaveapi">{{t('api_password')}}:</label>
                    <InputText class="my-2" id="chaveapi" v-model="Integracao.ChaveAPI" type="text" :disabled="validador" />
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="chave">{{t('key')}}:</label>
                    <Textarea v-model="Integracao.Chave" class="my-2 overflow-hidden" style="min-height: 30px" inputClass="w-full" rows="2" cols="30" :disabled="validador" />
                </div>
                <div class="full lg:col-12 md:col-12 sm:col-12">
                    <Button type="submit" :label="$t('sync')" icon="pi pi-check" class="mt-4" :disabled="validador" />
                </div>
            </div>
        </form>
    </div>
    <!-- Componente de loading que aparece durante a requisição -->
    <LoadingSpinner v-if="loading" />
</template>

<style scoped>
.full {
    width: 100%;  /* A largura do elemento que ocupa toda a linha */
}
</style>
