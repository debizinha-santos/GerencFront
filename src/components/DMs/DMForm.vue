<template>
    <div class="mt-5 mx-0 p-fluid grid">
        <!-- Seção para seleção de cliente -->
        <div class="full lg:col-12 md:col-12 sm:col-12">
            <label for="name">Cliente:</label>
            <!-- Dropdown para selecionar o cliente -->
            <Dropdown class="my-2" 
            v-model="selectedClient" 
            :options="ListaClientes"
            optionLabel="label" 
            optionValue="value" 
            placeholder="Selecione um" />
        </div> <!-- Fim da seção de seleção de cliente -->

        <!-- Seção para inserção do número da   -->
        <div class="full lg:col-6 md:col-9 sm:col-12">
            <label for="Numero">Numero da  :</label>
            <InputText class="my-2" v-model=" .Numero" id="Numero" />
        </div>

        <!-- Seção para inserção da identificação da   -->
        <div class="full lg:col-6 md:col-9 sm:col-12">
            <label for="Identificacao">Identificação da  :</label>
            <InputText class="my-2" v-model=" .Identificacao" id="Identificacao" />
        </div>

        <!-- Botão para salvar a   -->
        <Button label="Salvar" icon="pi pi-check" @click="save " class="full mt-4 mr-2" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'; // ref é usado para reatividade, onMounted é um hook(função especial) para executar código ao montar o componente, watch observa mudanças em valores reativos
import { useAuthStore } from '@/store/authStore.js'; //Usando a store de autenticação para pegar dados do usuário autenticado
import axios from '@/axios.js';//Instância configurada do Axios para fazer requisições HTTP

/**
 * Propriedades do componente.
 *
 * @typedef {Object} Props
 * @property {string} Numero - Número da   (Documento de Medição).
 * @property {string} Identificacao - Identificação única para a  .
 * @property {Object} selectedClient - Cliente selecionado para a  .
 * @property {Array} ListaClientes - Lista de clientes disponíveis para seleção.
 */

const   = ref({
    Numero: '', // Número da  
    Identificacao: '', // Identificação da  
});
const selectedClient = ref(null); // Cliente selecionado
const ListaClientes = ref([]); // Lista de clientes disponíveis
const store = useAuthStore(); // Acesso ao estado de autenticação

/**
 * Função chamada ao clicar no botão "Salvar".
 * Envia os dados da   para a API para ser adicionada.
 *
 * @async
 * @function save 
 */
const save  = async () => { // Função para salvar a  
    const data = {
        id_usuario: store.userId, // ID do usuário (do store de autenticação)
        ... .value, // Dados da  
    };

    try {
        const response = await axios.post('/ /adicionar', data, { // Requisição POST para adicionar a  
            headers: {
                Authorization: `Bearer ${store.token}`, // Envia o token para autenticação
            }
        });
        emit(' -saved'); // Emite evento para o componente pai de que a   foi salva
    } catch (error) {
        console.error('Erro ao adicionar  :', error); // Caso ocorra erro ao salvar
    }
};

/**
 * Função chamada para buscar a lista de clientes.
 *
 * @async
 * @function fetchClientes
 */
const fetchClientes = async () => {
    try {
        const response = await axios.post('/a in/cliente/listar', {}, { // Requisição POST para listar os clientes
            headers: {
                Authorization: `Bearer ${store.token}`, // Envia o token para autenticação
            }
        });

        // Mapeia os dados dos clientes para o formato esperado pelo Dropdown
        ListaClientes.value = response.data.map((cliente) => ({
            label: cliente.nome, // Nome do cliente
            value: {
                id_cliente: cliente.id_cliente, // ID do cliente
                nome_cliente: cliente.nome, // Nome do cliente
                usar_api: cliente.usar_api, // Se o cliente usa API
            }
        }));
    } catch (error) {
        console.error('Erro ao carregar clientes:', error); // Caso ocorra erro ao carregar os clientes
    }
};

// Chama fetchClientes quando o componente é montado
onMounted(() => {
    fetchClientes();//Chama a função para buscar os clientes
});

// Observa mudanças no ID do cliente na   e atualiza a seleção no Dropdown
watch(
    () =>  .value.IDcliente,//Observa mudanças no ID do cliente
    (newClienteId) => {//Função chamada quando o ID do cliente muda
        const client = ListaClientes.value.find((client) => client.value.id_cliente === newClienteId);//Busca o cliente com o ID
        if (client) {//Se o cliente foi encontrado
            selectedClient.value = client.value; // Atualiza o cliente selecionado
        }
    }
);
</script>