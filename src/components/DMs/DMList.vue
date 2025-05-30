<template>
    <!-- Componente que exibe uma tabela de  s -->
    <div class="col-12">
        <!-- Tabela de  s com filtros e paginação -->
        <DataTable
            v-model:filters="filters"
            :value="Lista S"
            selectionMode="single"
            tableStyle="min-width: 25%"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            stripedRows
            dataKey="id"
            :metaKeySelection="false"
            @rowSelect="onRowSelect"
            paginator
            :rows="10"
            :globalFilterFields="['id_ ', 'nome', 'email', 'nome_cliente', 'local', 'atualizado']"
        >
            <!-- Vincula a variável reativa "filters" ao estado dos filtros da tabela, permitindo que os filtros sejam controlados dinamicamente -->
            <!-- Define o valor da tabela como a lista de dados "Lista S", que será exibida nas linhas da tabela -->
            <!-- Permite a seleção de apenas uma linha por vez na tabela -->
            <!-- Define o estilo da tabela para garantir que a largura mínima da tabela seja de 25% -->
            <!-- Define as opções de quantidade de itens por página que o usuário pode escolher (5, 10, 20, 50) -->
            <!-- Aplica um estilo de listrado nas linhas da tabela, alternando as cores de fundo entre as linhas -->
            <!-- Define a chave única para cada linha da tabela. O valor de "id" será usado para identificar de forma exclusiva cada item de dados -->
            <!-- Desabilita a seleção de múltiplas linhas com a tecla "meta" (como Ctrl ou Command) -->
            <!-- Define o evento que será disparado quando uma linha for selecionada, chamando a função "onRowSelect" -->
            <!-- Habilita a paginação da tabela, permitindo que os dados sejam exibidos em várias páginas -->
            <!-- Define o número de linhas exibidas por página como 10 -->
            <!-- Define os campos que serão utilizados no filtro global para pesquisa -->
            <!-- Cabeçalho da tabela com filtro global -->
            <template #header>
                <div class="flex justify-content-end">
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                    </IconField>
                </div>
            </template>

            <!-- Definindo as colunas da tabela -->
            <Column field="ID_ " header="Id"></Column>
            <Column field="Numero" header="Número"></Column>
            <Column field="Identificacao" header="Identificação"></Column>
            <Column field="ClienteNome" header="Cliente"></Column>
            <Column field="local" header="Localização"></Column>
            <Column field="Ativo" header="Ativo">
                <template #body="{ data }">
                    <!-- Exibe ícone conforme o estado do 'Ativo' -->
                    <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.Ativo, 'pi-times-circle text-red-500': !data.Ativo }"></i>
                </template>
            </Column>
            <Column field="Updated" header="Atualizado">
                <template #body="{ data }">
                    <!-- Formatação de data -->
                    {{ formatDate(new Date(data.Updated)) }}
                </template>
            </Column>

            <!-- Coluna de Ação (Excluir  ) -->
            <Column style="min-width: 8rem">
                <template #body="slotProps">
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="delete (slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // Importa funções do Vue
import { useToast } from 'primevue/usetoast'; // Usado para mostrar notificações
import axios from '@/axios.js'; // Instância do Axios configurada para fazer requisições HTTP
import { FilterMatchMode } from 'primevue/api'; // Modo de filtro usado para pesquisa
import { useAuthStore } from '@/store/authStore.js'; // Acessa dados do usuário autenticado

/**
 * Variáveis reativas do componente.
 *
 * @typedef {Object} ReactiveState
 * @property {Array} Lista S - Lista de  s carregadas da API.
 * @property {Object} filters - Filtros de pesquisa aplicados na tabela.
 * @property {boolean} loading - Flag de carregamento enquanto as  s estão sendo buscadas.
 * @property {Object} toast - Função para exibir notificações ao usuário.
 * @property {Object} store - Dados do usuário autenticado.
 */
const Lista S = ref([]); // Lista de  s a ser exibida na tabela
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para pesquisa
});
const toast = useToast(); // Função para exibir notificações
const store = useAuthStore(); // Dados do usuário autenticado
const loading = ref(false); // Flag de carregamento

/**
 * Função chamada para buscar as  s associadas ao cliente.
 *
 * Realiza uma requisição POST para buscar as  s no backend, aplicando filtros conforme o tipo de usuário (a inistrador ou cliente).
 * A resposta é atribuída à variável `Lista S`.
 *
 * @function fetch S
 */
const fetch S = async () => {
    loading.value = true; // Ativa o carregamento
    let data = null;

    // Se o usuário for a inistrador, busca todas as  s, senão, filtra por cliente
    if (a in()) {
        data = ''; // A in pode acessar todas as  s
    } else {
        data = { id_cliente: store.userIdCliente }; // Cliente busca apenas suas  s
    }

    try {
        const response = await axios.post('/ /listar', data, {
            headers: { Authorization: `Bearer ${store.token}` }
        });
        Lista S.value = response.data; // Atribui as  s retornadas à lista
    } catch (error) {
        console.error('Erro ao carregar  s:', error); // Exibe erro se houver falha
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

/**
 * Executa a função `fetch S` quando o componente é montado.
 *
 * @function onMounted
 */
onMounted(() => {
    fetch S();
});

/**
 * Função chamada quando uma linha da tabela é selecionada.
 *
 * Emite o evento `row-selected` para o componente pai, passando os dados da linha selecionada.
 *
 * @function onRowSelect
 * @param {Object} event - Evento de seleção da linha da tabela.
 */
const onRowSelect = async (event) => {
    emit('row-selected', event.data); // Emite o evento de seleção de linha
};

/**
 * Função chamada para excluir uma  .
 *
 * Emite o evento `delete- ` com os dados da   que deve ser excluída.
 *
 * @function delete 
 * @param {Object} item - Dados da   a ser excluída.
 */
const delete  = async (item) => {
    emit('delete- ', item); // Emite evento para exclusão da  
};

/**
 * Função que verifica se o usuário é um a inistrador.
 *
 * Retorna `true` se o usuário for um a inistrador, caso contrário, `false`.
 *
 * @function a in
 * @returns {boolean} - Retorna `true` se o usuário for a inistrador.
 */
const a in = () => {
    return store.userRole === 'A inistrador'; // Verifica o papel do usuário
};

/**
 * Função para formatar a data de atualização da  .
 *
 * A data é formatada no formato `dd/mm/yyyy hh:mm`. Se a data for inválida, retorna 'Data inválida'.
 *
 * @function formatDate
 * @param {Date} value - Valor da data a ser formatada.
 * @returns {string} - A data formatada.
 */
const formatDate = (value) => {
    if (!value) return '';
    try {
        const date = new Date(value); // Converte para objeto Date
        if (isNaN(date)) throw new Error('Data inválida');
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const day = String(localDate.getDate()).padStart(2, '0');
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const year = localDate.getFullYear();
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`; // Retorna a data formatada
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida'; // Se houver erro na formatação, retorna mensagem de erro
    }
};
</script>
