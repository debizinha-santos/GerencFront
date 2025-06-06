<script setup>
// Importação dos hooks e bibliotecas do Vue e PrimeVue
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import { FilterMatchMode } from 'primevue/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useDataStore } from '@/store/dataStore.js';
import { FormatarListaCliente } from '@/helpers/ Helper.js';
import usuario Service from '@/services/usuario Service';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Variáveis reativas para controle da aplicação
const active = ref(0); // Controle de abas ativas
const dataStore = useDataStore(); // Acesso aos dados da store
const store = useAuthStore(); // Acesso aos dados de autenticação
const loading = ref(false); // Controle do estado de loading (carregamento)
const toast = useToast(); // Hook para exibição de mensagens
const visible = ref(false); // Controle da visibilidade do formulário
const senha = ref(''); // Senha digitada no formulário
const senhaAlterada = ref(false); // Flag para indicar se a senha foi alterada
const SenhaBE = ref(''); // Armazena a senha original para comparação
const errors = ref({}); // Objeto para armazenar os erros de validação
const deleteUsuarioDialog = ref(false); // Controle da exibição do diálogo de deleção
const item = ref({}); // Objeto para armazenar o item selecionado
const selected  = ref(null); // Dados do   selecionado
const ListaClientes = ref([]);
const Lista S = ref([]); // Lista de  
const isSameSenha = () => { // Função para verificar se a senha inserida é a mesma
    return usuario.value.senha === SenhaBE.value; 
};
const filterUser = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
}); // Filtro global para a busca de usuários
const filter  = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const filteredCount = ref(0); // Contador de resultados filtrados

// Objeto para armazenar os dados do usuário
const usuario = ref({
    id_cliente:'',
    nome: '',
    login: '',
    senha: '',
    ativo: true
});

const ListaUsuario = ref([]); // Lista de usuários
const isA in  = () => {  return store.userRole === 'A inistrador'}; // Verifica se o usuário é a inistrador
/**
 * Função chamada ao selecionar uma linha da tabela
 * @param {Object} event - Dados do evento gerado ao selecionar uma linha
 */
 const onRowSelect = (event) => {
    visible.value = true; // Exibe o formulário de edição
    usuario.value = { ...event.data }; // Copia os dados do usuário selecionado

    // Verifica se a propriedade  Options existe em usuario
    const  Ids = usuario.value?. Options || []; // Se  Options não existir, usa um array vazio
    selected .value = Lista S.value
        .filter(  =>  Ids.includes( .value)) // Compara os valores de id_ 
        .map(  => ({ value:  .value, label:  .label })); // Mapeia o objeto final

    senha.value = usuario.value.senha; // Armazena a senha para edição
    SenhaBE.value = usuario.value.senha; // Armazena a senha original para comparação
    senhaAlterada.value = false; // Reseta a flag de senha alterada
    active.value = 1; // Ativa a aba de edição
};

/**
 * Função para voltar ao estado inicial
 */
const voltar = () => {
    active.value = 0; // Retorna à aba inicial
    resetForm(); // Reseta o formulário
};

/**
 * Função para submeter o formulário
 */
 const submitForm = () => {
    if (validateForm()) { // Valida o formulário
        if (visible.value) { // Se o formulário está visível (edição)
            atualizarUsuario(); // Atualiza o usuário
        } else { // Se o formulário não está visível (criação)
            saveUsuario(); // Salva o novo usuário
        }
    }
};

/**
 * Função para validar o formulário
 * @returns {boolean} - Retorna true se o formulário for válido
 */
const validateForm = () => {
    errors.value = {}; // Reseta os erros
    validateSenha(); // Valida a senha
    return Object.keys(errors.value).every((key) => errors.value[key] === null); // Verifica se todos os erros são nulos
};

/**
 * Função para validar a senha
 */
const validateSenha = () => {
    if (senha.value !== usuario.value.senha) { // Se as senhas não coincidem
        errors.value.senha = 'A senha NÃO é a mesma'; // Mensagem de erro
    } else {
        errors.value.senha = null; // Senha válida, reseta o erro
    }
};

/**
 * Função para salvar um novo usuário
 */
const saveUsuario = async () => {
    let data = null;
    if (isA in()) { // Se o usuário for um a inistrador
        data = { ...usuario.value, id_usuario: store.userId }; // Adiciona o ID do usuário
    } else { // Se o usuário for de outro tipo
        data = { ...usuario.value, id_cliente: store.userIdCliente, id_usuario: store.userId }; // Adiciona o ID do cliente e usuário
    }
    try {
        const response = await usuario Service.adicionarUsuario (data); // Chamada API para adicionar o usuário
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario   criado', life: 3000 }); // Exibe a mensagem de sucesso
        fetchUsuarios(); // Atualiza a lista de usuários
        active.value = 0; // Retorna à aba inicial.
        resetForm(); // Reseta o formulário.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao adicionar Usuario:', error); // Mensagem de erro
    } finally {
        loading.value = false; // Desativa o carregamento
    }
    loading.value = true; // Ativa o carregamento
};

/**
 * Função para atualizar um usuário
 */
const atualizarUsuario = async () => {
    loading.value = true; // Ativa o carregamento
    const data = {
        ...usuario.value, // Copia os dados do usuário
         Options: selected .value, // Adiciona as opções de   selecionadas
        id_usuario: store.userId // Adiciona o ID do usuário
    };
    if (isSameSenha()) { // Se a senha não foi alterada
        delete data.senha; // Remove a senha do objeto
    }
    try {
        const response = await usuario Service.atualizarUsuario (data); // Chamada API para atualizar o usuário
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario   atualizado', life: 3000 }); // Exibe a mensagem de sucesso
        fetchUsuarios(); // Atualiza a lista de usuários
        active.value = 0; // Volta à aba de listagem
        resetForm(); // Reseta o formulário
    } catch (error) {
        console.error('Erro ao atualizar o Usuario:', error); // Mensagem de erro
    } finally {
        loading.value = false; // Desativa o carregamento
    }
    loading.value = true; // Ativa o carregamento
};

/**
 * Função para buscar todos os usuários
 */
 const fetchUsuarios = async () => {
    loading.value = true; // Ativa o carregamento
    let data = null;

    if (isA in()) { // Se o usuário for um a inistrador
        data = ''; // Não filtra por cliente
    } else { // Se o usuário não for a inistrador
        data = { id_cliente: store.userIdCliente }; // Filtra pelo ID do cliente
    }

    try {
        const response = await usuario Service.listarUsuarios (data); // Chamada API para listar os usuários
        ListaUsuario.value = response.data; // Armazena os usuários na lista
        filteredCount.value = ListaUsuario.value.length; // Atualiza o contador de usuários
    } catch (error) {
        console.error('Erro ao carregar usuários:', error); // Mensagem de erro
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};
const fetchCliente = async () => {
    loading.value = true; // Ativa o carregamento ao buscar clientes.
    try {
            const response = await usuario Service.listaSimplesClientes();
            ListaClientes.value = [...FormatarListaCliente(response.data, true)]; // Atualiza a lista de clientes.

    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao listar Clientes:', error); // Log de erro.
    } finally {
        loading.value = false; // Desativa o carregamento.
    }
};
/**
 * Watch para atualizar o contador de resultados filtrados
 */
watch(() => filter .value.global.value, () => {
    filteredCount.value = ListaUsuario.value.filter(item => {
        const filterValue = filter .value.global.value?.toLowerCase() || '';
        return Object.values(item).some(val => val && val.toString().toLowerCase().includes(filterValue)); // Filtra os usuários
    }).length;
}, { immediate: true }); // Aciona imediatamente

/**
 * Watch para controlar a mudança de abas
 */
 watch(active, (newIndex, oldIndex) => {
    // Quando a aba ativa mudar para "listagem de usuários" (aba 0)
    if (newIndex === 0 && oldIndex !== newIndex) {
        resetForm(); // Reseta o formulário
        fetchUsuarios(); // Atualiza a lista de usuários
        visible.value = false; // Oculta o formulário
    }
});

/**
 * Função para carregar os dados iniciais
 */
const loadData = async () => {
    try {
        const  s = dataStore. s || await dataStore.fetchLista s(); // Carrega os  s

        // Exclui a opção 'Todos' e obtém os outros dados
        Lista S.value =  s.filter(  =>  .label !== 'Todos'); // Filtra os  s
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error); // Mensagem de erro
    }
};

// Função chamada ao montar o componente
onMounted(() => {
    loadData(); // Carrega os  s
    fetchUsuarios(); // Carrega a lista de usuários
    if(isA in()){
        fetchCliente(); // Carrega a lista de clientes
    }
});

/**
 * Função para exibir o diálogo de deleção
 * @param {Object} itm - Dados do item a ser deletado
 */
const deleteUsuariodes = (itm) => {
    item.value = itm; // Armazena os dados do item
    deleteUsuarioDialog.value = true; // Exibe o diálogo de confirmação
};

/**
 * Função para deletar um usuário
 * @param {Object} item - Dados do usuário a ser deletado
 */
const deleteUsuario = async (item) => {
    loading.value = true; // Ativa o carregamento
    let data = { id: item.id, id_usuario: store.userId }; // Prepara os dados para a requisição

    try {
        await usuario Service.deletarUsuario (data);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuário deletado', life: 3000 }); // Exibe mensagem de sucesso
        deleteUsuarioDialog.value = false; // Fecha o diálogo de confirmação
        fetchUsuarios(); // Atualiza a lista de usuários
        active.value = 0; // Volta à aba de listagem
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o usuário.', life: 3000 }); // Exibe mensagem de erro
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

/**
 * Função para resetar o formulário
 */
 const resetForm = () => {
    usuario.value.nome = ''; // Reseta o nome
    usuario.value.login = ''; // Reseta o login
    usuario.value.senha = ''; // Reseta a senha
    usuario.value.id_cliente = ''; // Reseta o cliente
    usuario.value.ativo = true; // Reseta o estado de ativo
    selected .value = []; // Reseta as opções de  
    senha.value = ''; // Reseta o campo "Confirme a Senha"
    SenhaBE.value = ''; // Reseta a senha original
    senhaAlterada.value = false; // Reseta a flag de senha alterada
};
</script>

<template>
    <!-- Container geral da página com grid de layout -->
    <div class="grid">
        <!-- Coluna principal que contém a card com o título e o conteúdo -->
        <div class="col-12">
            <div class="card">
                <!-- Componente TabView para controlar as abas de navegação -->
                <TabView v-model:activeIndex="active">
                    <!-- Aba para listar os usuários   -->
                    <TabPanel :header="$t(' _user_list')">
                        <div class="col-12">
                            <!-- Componente DataTable para exibir os usuários -->
                            <DataTable 
                                v-model:filters="filter " 
                                :value="ListaUsuario"
                                stripedRows 
                                paginator 
                                :rows="10" 
                                removableSort 
                                :rowsPerPageOptions="[5, 10, 20, 50]" 
                                :globalFilterFields="['nome', 'login']" 
                                selectionMode="single" 
                                tableStyle="min-width: 50rem; table-layout: fixed;" 
                                dataKey="id" 
                                :metaKeySelection="false" 
                                @rowSelect="onRowSelect" 
                                :sortOrder="1" 
                                :sortField="'nome'" 
                            >

                            <!-- A tabela exibe os dados provenientes de "ListaUsuario" -->
                                <!-- Aplica um estilo de linhas alternadas para melhorar a legibilidade -->
                                <!-- Permite ao usuário remover a ordenação clicando novamente na coluna que está sendo usada para ordenar -->
                                <!-- Habilita a funcionalidade de paginação para dividir os dados em várias páginas -->
                                <!-- O número de linhas por página é fixado em 10 -->
                                <!-- As opções de quantidade de itens por página são 5, 10, 20 ou 50 -->
                                <!-- O campo "id" é utilizado como chave única para cada linha da tabela -->
                                <!-- Permite selecionar apenas uma linha por vez -->
                                <!-- Desabilita a seleção de múltiplas linhas com a tecla "meta" -->
                                <!-- Quando uma linha é selecionada, a função "onRowSelect" é chamada -->
                                <!-- A ordenação inicial é definida por "nome" com ordem crescente -->
                            
                                <!-- Cabeçalho da tabela com filtro e contagem -->
                                <template #header>
                                    <div class="flex justify-content-between mt-4">
                                        <div class="font-semibold">
                                            <span>{{$t('total_records',{count: filteredCount})}}</span><!-- Exibe a quantidade de registros filtrados -->
                                        </div>
                                        <!-- Componente para busca global na tabela -->
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" /> <!-- Ícone de busca -->
                                            </InputIcon>
                                            <!-- Campo de texto para busca -->
                                            <InputText v-model="filter ['global'].value" :placeholder="t('search')" />
                                        </IconField>
                                    </div>
                                </template>

                                <!-- Mensagem exibida quando não há dados -->
                                <template #empty> {{t('empty_user')}} </template>

                                <!-- Coluna para o nome do usuário -->
                                <Column field="nome" sortable style="width: 30%;" :header="t('name')"></Column>

                                <!-- Coluna para o login do usuário -->
                                <Column field="login" sortable style="width: 50%;" :header="t('login')">
                                    <template #body="{ data }">
                                        <!-- Exibe o login com tooltip -->
                                        <span v-tooltip="data.login">{{ data.login }}</span>
                                    </template>
                                </Column>

                                <!-- Coluna para status de ativo do usuário -->
                                <Column field="ativo" sortable style="width: 9%; text-align: center;" :header="t('status_active')">
                                    <template #body="{ data }">
                                        <!-- Ícone condicional para exibir se o usuário está ativo ou inativo -->
                                        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                                    </template>
                                </Column>

                                <!-- Coluna para o botão de excluir o usuário -->
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <!-- Botão de excluir com evento de deleção -->
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteUsuariodes(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>

                    <!-- Aba para editar ou adicionar um usuário   -->
                    <TabPanel :header="visible ?  t('edit_ ') : t('add_ ')">
                        <div class="mt-5 mx-0 p-fluid grid">
                            <!-- Campo para o nome do usuário -->
                            <div class="full xl:col-6 lg:col-6 md:col-8 sm:col-12">
                                <label for="name">{{$t('name')}}</label>
                                <InputText class="my-2" v-model="usuario.nome" id="name" type="text" />
                            </div>

                        

                            <!-- Campo para o login do usuário -->
                            <div class="full xl:col-6 lg:col-6 md:col-8 sm:col-12">
                                <label for="email">{{$t('login')}}</label>
                                <InputText class="my-2" v-model="usuario.login" id="email" />
                            </div>

<!-- Campo para a senha do usuário -->
                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="senha">{{$t('password')}}</label>
                                <InputText class="my-2" id="senha" v-model="usuario.senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <!-- Exibe erro se a senha for inválida -->
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                            </div>

                            <!-- Campo para confirmar a senha -->
                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="senha">{{$t('confirm_password')}}</label>
                                <InputText class="my-2" id="senha" v-model="senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <!-- Exibe erro se as senhas não coincidirem -->
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                            </div>
                            <!-- Campo para indicar se o usuário está ativo -->
                            <div class="full flex flex-column align-items-center xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch2">{{$t('active_user')}}</label>
                                <div class="grid mt-3">
                                    <InputSwitch v-model="usuario.ativo" inputId="switch2" class="mr-2" />
                                    <span class="ml-2">{{ usuario.ativo ? t('yes') : t('no') }}</span>
                                </div>
                            </div>
                            
                            <div v-if="isA in()" class="xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="perfil">{{$t('client')}}</label>
                                <Dropdown class="my-2" id="perfil" v-model="usuario.id_cliente" :options="ListaClientes" optionLabel="label" optionValue="value" :placeholder="$t('choose_one')" @change="fetchIdPlanta"></Dropdown>
                                <!-- Dropdown para selecionar o cliente, visível apenas se for a in -->
                            </div>
                            
                            <!-- Botões para salvar, excluir ou voltar -->
                            <div class="flex align-items-center justify-content-end field col-12 mt-6">
                                <Button v-if="visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="t('save')" icon="pi pi-check" severity="primary" @click="atualizarUsuario" />
                                <Button v-if="visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="t('delete')" icon="pi pi-trash" severity="danger" @click="deleteUsuariodes(usuario)" />
                                <Button style="width: 15%" class="buttons flex align-items-center justify-content-center m-2 mr-0" :label="t('back')" icon="pi pi-arrow-left" severity="primary" @click="voltar()" />
                                <Button v-if="!visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="t('save')" icon="pi pi-check" severity="info" @click="submitForm" />
                            </div>

                            <!-- Divider para separar a seção -->
                            <Divider class="mt-4"  type="solid" />
                        </div>

                        <!-- Tabela de  s para associar ao usuário -->
                        <div class="col-12" v-if="visible">
                            <DataTable 
                                v-model:filters="filterUser" 
                                v-model:selection="selected " :value="Lista S" 
                                stripedRows
                                paginator
                                :rows="10"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['label']"
                                dataKey="value" 
                                tableStyle="min-width: 50rem; table-layout: fixed;" 
                                :metaKeySelection="false"
                                :size="small"
                                removableSort
                                :sortOrder="1">

                                <!-- A tabela exibe os dados provenientes de 'Lista S' -->
                                 <!-- As linhas da tabela têm um estilo de alternância (listradas) para facilitar a leitura -->
                                <!-- A tabela tem uma largura mínima de 50rem e um layout fixo para garantir que as colunas tenham larguras constantes -->
                                <!-- Permite ao usuário escolher entre várias opções de quantidade de linhas por página: 5, 10, 20 ou 50 -->
                                <!-- A tabela pode ser filtrada globalmente pelos campos 'label' -->
                                <!-- Permite a remoção da ordenação clicando novamente na coluna usada para ordenar -->
                                <!-- A tabela é paginada com 10 linhas por página, e o usuário pode navegar entre as páginas -->

                                <!-- Cabeçalho da tabela de  s -->
                                <template #header>
                                    <div class="flex justify-content-end">
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" /> <!-- Ícone de busca -->
                                            </InputIcon>
                                            <InputText v-model="filterUser['global'].value" :placeholder="t('search')" />
                                        </IconField>
                                    </div>
                                </template>
                                <!-- Coluna para a seleção múltipla de  s -->
                                <Column selectionMode="multiple" :style="{ width: '5%' }"></Column>
                                <!-- Coluna para o nome da   -->
                                <Column field="label" sortable :header="t('name')" class="col-12 md:col-6" :style="{ width: '80%' }"> </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                </TabView>

                <!-- Diálogo de confirmação de exclusão de usuário -->
                <Dialog :header="t('delete_user')" v-model:visible="deleteUsuarioDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span class="">
                            <!-- Mensagem de confirmação de exclusão -->
                            {{ $t('confirm_delete_user', { id: item.id_cliente, name: item.nome }) }}
                        </span>
                    </div>
                    <!-- Rodapé do diálogo com botões de "Não" e "Sim" -->
                    <template #footer>
                        <Button :label="t('no')" icon="pi pi-times" @click="deleteUsuarioDialog = false" class="p-button-text" />
                        <Button :label="t('yes')" icon="pi pi-check" @click="deleteUsuario(item)" class="p-button-text" />
                    </template>
                </Dialog>
                <!-- Componente de carregamento enquanto a ação é processada -->
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Responsividade para telas menores que 780px */
@media (max-width: 780px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>
