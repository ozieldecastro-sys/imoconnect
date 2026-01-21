export default function CaptureLead() {
  return (
    <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <h1>Encontre o imóvel ideal para você</h1>
      <p>Preencha os dados abaixo e fale com um corretor agora mesmo.</p>

      <form>
        <input placeholder="Seu nome" />
        <input placeholder="Seu WhatsApp" />
        
        <select>
          <option>Comprar</option>
          <option>Alugar</option>
          <option>Vender</option>
        </select>

        <input placeholder="Cidade" />

        <button type="submit">Quero atendimento</button>
      </form>
    </div>
  );
}
