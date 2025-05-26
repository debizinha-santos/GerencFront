import axios from '@/axios.js';

const postRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

const usuario Service = {
    async listarUsuarios (data) {
        return postRequest('/U /listar', data);
    },
    async listarU Simples(data) {
        return postRequest('/U /listaSimples', data);
    },
    async adicionarUsuario (data) {
        return postRequest('/U /adicionar', data);
    },
    async deletarUsuario (data) {
        return postRequest('/U /deletar', data);
    },
    async atualizarUsuario (data) {
        return postRequest('/U /atualizar', data);
    },
    async listaSimplesClientes() {
        return postRequest('/a in/cliente/listaSimples');
    },
};

export default usuario Service;