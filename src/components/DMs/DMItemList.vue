<!--  ItemList.vue -->
<template>
    <div class="card">
        <h5 class="mt-2">Itens da  </h5>
        <!-- Botão para adicionar itens à   -->
        <Button class="m-1" label="Adicionar Itens" @click="emit('add-item')" />

        <div class="mt-5 mx-0 p-fluid grid">
            <!-- Tabela de Itens -->
            <DataTable :value="ListaItens" selectionMode="single" tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection" paginator :rows="10">
                <!-- A tabela exibe os dados provenientes de "ListaItens" -->
                <!-- Permite selecionar apenas uma linha por vez -->
                <!-- Aplica um estilo de largura mínima de 25% ao componente da tabela -->
                <!-- Define as opções de quantidade de itens por página, oferecendo ao usuário 5, 10, 20 ou 50 itens por página -->
                <!-- Aplica um estilo alternado nas linhas da tabela, facilitando a leitura -->
                <!-- Define o campo "id" como a chave única de cada item na tabela -->
                <!-- Desabilita a seleção de múltiplas linhas com a tecla "meta" (Ctrl/Command) -->
                <!-- Emite o evento "rowSelect" quando uma linha for selecionada, chamando a função "handleRowSelection" -->
                <!-- Habilita a paginação e define que cada página exibirá 10 linhas -->

                <!-- Coluna SKU -->
                <Column field="SKU" header="SKU"></Column>
                <!-- Coluna Produto -->
                <Column field="Nome_Produto" header="Produto"></Column>
                <!-- Coluna Controladora/Placa/Motor -->
                <Column field="Posicao" header="Controladora/Placa/Motor 1/ Motor 2"></Column>
                <!-- Coluna Quantidade -->
                <Column field="QTD" header="QTD"></Column>
                <!-- Coluna de Ação (Excluir) -->
                <Column style="min-width: 8rem">
                    <template #body="slotProps">
                        <!-- Botão de Exclusão -->
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteItem(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'; // ref é usados para reatividade
import axios from '@/axios.js'; //Instância configurada do Axios para fazer requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; //Usando a store de autenticação para pegar dados do usuário autenticado

/**
 * Variáveis reativas do componente.
 *
 * @typedef {Object} ReactiveState
 * @property {Array} ListaItens - Lista de itens carregados da API.
 * @property {boolean} loading - Flag de carregamento enquanto os itens estão sendo buscados.
 * @property {Object} store - Dados do usuário autenticado.
 */
const ListaItens = ref([]); //lista de itens, inicialmente vazia
const store = useAuthStore(); //Usando a store de autenticação para acessar dados do usuário
const loading = ref(false); //Flag de carregamento enquanto os dados estão sendo processados

/**
 * Função para carregar itens associados à  
 *
 * Realiza uma requisição POST para buscar os itens da  s no backend.
 * A resposta é atribuída à variável `ListaItens`.
 *
 * @function fetch S
 */
const fetchItem  = async () => {// Função para carregar os itens da  
    loading.value = true; // Ativa o estado de carregamento
    try {
        // Criação do objeto de dados a ser enviado na requisição
        const data = {
            id_ :  .ID_ , // Identificador único da  
            id_cliente: store.userIdCliente, // Identificador do cliente
            id_usuario: store.userId // Identificador do usuário
        };

        const response = await axios.post('/ /listaritens', data);// Realiza uma requisição POST para buscar os itens da  

        // Atribui os itens retornados à lista de itens
        ListaItens.value = response.data;// Atribui os itens retornados à lista de itens
    } catch (error) { // Captura e exibe qualquer erro ocorrido durante a requisição
        // Captura e exibe qualquer erro ocorrido durante a requisição
        console.error('Erro ao carregar Itens:', error); // Exibe o erro no console
    } finally {// Desativa o estado de carregamento, independentemente de sucesso ou falha
        // Desativa o estado de carregamento, independentemente de sucesso ou falha
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Executa a função `fetchItem ` quando o componente é montado.
 *
 * @function onMounted
 */
onMounted(() => {
    fetchItem ();// Executa a função fetchItem  quando o componente é montado
});

/**
 *  Função para emitir evento de exclusão de um item.
 *
 * @function deleteItem
 * @param {number} item - item a ser excluído
 */
const deleteItem = async (item) => {
    emit('delete-item', item); // Emite o evento 'delete-item' com o item a ser excluído
};

/**
 *  Função para lidar com a seleção de uma linha
 *
 * @function handleRowSelection
 * @param {Object} event - Evento de seleção da linha da tabela.
 */
const handleRowSelection = (event) => {
    emit('row-selected', event.data);// Emite o evento 'row-selected' com os dados da linha selecionada
};
</script>
