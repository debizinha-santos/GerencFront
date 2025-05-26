import axios from '@/axios.js';

const postRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

const  Service = {
    async listar s(data) {
        return postRequest('/ /listar', data);
    },
    async listar Paginado(data) {
        return postRequest('/ /listarPaginado', data);
    },
    async listar Id() {
        return postRequest('/ /lista Id');
    },
    async adicionar (data) {
        return postRequest('/ /adicionar', data);
    },
    async deletar (data) {
        return postRequest('/ /delete', data);
    },
    async atualizar (data) {
        return postRequest('/ /atualizar', data);
    },
    async fetchItem (data) {
        return postRequest('/ /listaritens', data);
    },
    async adicionarItem(data) {
        return postRequest('/ /adicionarItens ', data);
    },
    async deletarItem(data) {
        return postRequest('/ /deleteItem', data);
    },
    async listarProduto(data) {
        return postRequest('/produtos/listar', data);
    },
    async listarClientes() {
        return postRequest('/a in/cliente/listar', {});
    },
    async atualizarProduto(data) {
        return postRequest('/ /atualizarItens', data);
    },
    async infoEntrada(data) {
        return postRequest('/ /recuperarInfo', data);
    },
    async atualizarInfo(data) {
        return postRequest('/ /updateInfo', data);
    },
    async validarExternalData(data) {
        return postRequest('/ /validar', data);
    },
};

export default  Service;
