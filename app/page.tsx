'use client'
import { useEffect, useState } from "react";

type Ordine = {
  prodotto: string;
  tempoProduzione: number;
  quantita: number;
};

type OrdineAssegnato = {
  orarioInizio: string;
  ordini: Ordine[];
};

function calcolaSlotDisponibili(
  orarioInizioPrenotazioni: string,
  orarioFinePrenotazioni: string,
  intervalloPrenotazioni: number,
  ordini: Ordine[],
  ordiniAssegnati: OrdineAssegnato[]
): { orario: string; disponibile: boolean }[] {
  const convertiOrarioInMinuti = (orario: string): number =>
    orario.split(":").reduce((acc, parte, indice) => acc + Number(parte) * (indice === 0 ? 60 : 1), 0);

  const convertiMinutiInOrario = (minuti: number): string =>
    [Math.floor(minuti / 60).toString().padStart(2, "0"), (minuti % 60).toString().padStart(2, "0")].join(":");

  const inizioPrenotazioni = convertiOrarioInMinuti(orarioInizioPrenotazioni);
  const finePrenotazioni = convertiOrarioInMinuti(orarioFinePrenotazioni);

  const tempoTotaleProduzione = ordini.reduce(
    (acc, ordine) => acc + ordine.tempoProduzione * ordine.quantita,
    0
  );

  const orariOccupati = ordiniAssegnati.map((ordineAssegnato) => {
    const inizioAssegnato = convertiOrarioInMinuti(ordineAssegnato.orarioInizio);
    const tempoProduzioneAssegnato = ordineAssegnato.ordini.reduce(
      (acc, ordine) => acc + ordine.tempoProduzione * ordine.quantita,
      0
    );
    return { inizio: inizioAssegnato, fine: inizioAssegnato + tempoProduzioneAssegnato };
  });

  return Array.from(
    { length: Math.floor((finePrenotazioni - inizioPrenotazioni) / intervalloPrenotazioni) + 1 },
    (_, i) => inizioPrenotazioni + i * intervalloPrenotazioni
  ).map((orarioCorrente) => {
    const fineCorrente = orarioCorrente + tempoTotaleProduzione;

    // Calc quanto tempo è già occupato nello slot corrente
    const tempoOccupato = orariOccupati.reduce((acc, occupato) => {
      if (orarioCorrente < occupato.fine && fineCorrente > occupato.inizio) {
        const inizioSovrapposizione = Math.max(orarioCorrente, occupato.inizio);
        const fineSovrapposizione = Math.min(fineCorrente, occupato.fine);
        return acc + (fineSovrapposizione - inizioSovrapposizione);
      }
      return acc;
    }, 0);

    // Calco tempo residuo disponibile nello slot
    const tempoResiduo = intervalloPrenotazioni - tempoOccupato;

    // check se ordine può essere completato nello slot corrente
    const disponibile =
      tempoResiduo >= tempoTotaleProduzione && // Deve esserci spazio sufficiente
      fineCorrente <= finePrenotazioni; // Deve rientrare nell'orario di prenotazione

      /** forse fixato ultimo slot*/
    // Gestione per l'ultimo slot santell o sant agata
    const ultimoSlot =
      orarioCorrente + intervalloPrenotazioni !== finePrenotazioni && // invertendo da === a !== sembra calcolare bene , da testare tutto
      tempoOccupato + tempoTotaleProduzione <= intervalloPrenotazioni;
/** */
    return { orario: convertiMinutiInOrario(orarioCorrente), disponibile: disponibile || ultimoSlot };
  });
}



// function calcolaSlotDisponibili(
//   orarioInizioPrenotazioni: string,
//   orarioFinePrenotazioni: string,
//   intervalloPrenotazioni: number,
//   ordini: Ordine[],
//   ordiniAssegnati: OrdineAssegnato[]
// ): { orario: string; disponibile: boolean }[] {
//   const convertiOrarioInMinuti = (orario: string): number =>
//     orario.split(":").reduce((acc, parte, indice) => acc + Number(parte) * (indice === 0 ? 60 : 1), 0);

//   const convertiMinutiInOrario = (minuti: number): string =>
//     [Math.floor(minuti / 60).toString().padStart(2, "0"), (minuti % 60).toString().padStart(2, "0")].join(":");

//   const inizioPrenotazioni = convertiOrarioInMinuti(orarioInizioPrenotazioni);
//   const finePrenotazioni = convertiOrarioInMinuti(orarioFinePrenotazioni);

//   const tempoTotaleProduzione = ordini.reduce(
//     (acc, ordine) => acc + ordine.tempoProduzione * ordine.quantita,
//     0
//   );

//   const orariOccupati = ordiniAssegnati.map((ordineAssegnato) => {
//     const inizioAssegnato = convertiOrarioInMinuti(ordineAssegnato.orarioInizio);
//     const tempoProduzioneAssegnato = ordineAssegnato.ordini.reduce(
//       (acc, ordine) => acc + ordine.tempoProduzione * ordine.quantita,
//       0
//     );
//     return { inizio: inizioAssegnato, fine: inizioAssegnato + tempoProduzioneAssegnato };
//   });

//   return Array.from(
//     { length: Math.floor((finePrenotazioni - inizioPrenotazioni) / intervalloPrenotazioni) + 1 },
//     (_, i) => inizioPrenotazioni + i * intervalloPrenotazioni
//   ).map((orarioCorrente) => {
//     const fineCorrente = orarioCorrente + tempoTotaleProduzione;

//     // Calc tempo occupato nello slot corrente
//     const tempoOccupato = orariOccupati.reduce((acc, occupato) => {
//       if (orarioCorrente < occupato.fine && fineCorrente > occupato.inizio) {
//         const inizioSovrapposizione = Math.max(orarioCorrente, occupato.inizio);
//         const fineSovrapposizione = Math.min(fineCorrente, occupato.fine);
//         return acc + (fineSovrapposizione - inizioSovrapposizione);
//       }
//       return acc;
//     }, 0);

//     // Calc tempo residuo disponibile nello slot
//     const tempoResiduo = intervalloPrenotazioni - tempoOccupato;

//     // check se l'ordine può essere completato nello slot corrente
//     const disponibile =
//       tempoResiduo >= tempoTotaleProduzione && // Deve esserci spazio sufficiente
//       fineCorrente <= finePrenotazioni; // Deve rientrare nell'orario di prenotazione

//     /** rappezzo ultimo slot zona incriminata santell */
    
//     const distribuzioneOrdini =
//       orarioCorrente + intervalloPrenotazioni <= finePrenotazioni &&
//       tempoResiduo + intervalloPrenotazioni >= tempoTotaleProduzione;
// /**  fine zona incriminata */
//     return { orario: convertiMinutiInOrario(orarioCorrente), disponibile: disponibile || distribuzioneOrdini };
//   });
// }


export default function Home() {
  const [slot, impostaSlot] = useState<{ orario: string; disponibile: boolean }[]>([]);

  useEffect(() => {
    const orarioInizioPrenotazioni = "12:00";
    const orarioFinePrenotazioni = "22:00";
    const intervalloPrenotazioni = 60;
    const ordini: Ordine[] = [
      { prodotto: "Pizza", tempoProduzione: 11, quantita: 4 },
      { prodotto: "Patatine", tempoProduzione: 2, quantita: 3 },
    ];

    const ordiniAssegnati: OrdineAssegnato[] = [
      {
        orarioInizio: "13:00",
        ordini: [
          { prodotto: "Pizza", tempoProduzione: 10, quantita: 1 },
          { prodotto: "Patatine", tempoProduzione: 2, quantita: 1 },
        ],
      },
    ];

    const slotCalcolati = calcolaSlotDisponibili(
      orarioInizioPrenotazioni,
      orarioFinePrenotazioni,
      intervalloPrenotazioni,
      ordini,
      ordiniAssegnati
    );

    impostaSlot(slotCalcolati);
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start bg-white p-10 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Orari disponibili</h1>
        <ul className="list-disc list-inside text-gray-600">
          {slot.map((s, indice) => (
            <li
              key={indice}
              className={`py-1 text-lg ${s.disponibile ? 'text-green-600' : 'text-red-600'}`}
            >
              <span className="font-medium">{s.orario}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
