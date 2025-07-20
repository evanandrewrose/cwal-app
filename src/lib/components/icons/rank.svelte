<script lang="ts">
  import Badge from "@/lib/components/ui/badge/badge.svelte";

  type Props = {
    rank: string;
  };

  const { rank }: Props = $props();

  const value = rank[0].toUpperCase();
</script>

{#if value === "S"}
  <Badge class="bg-[#332905] text-[#fcdd15] border-[#fcdd15]">{value}</Badge>
{:else if value === "A"}
  <Badge class="bg-[#310802] text-[#fd2a00] border-[#fd2a00]">{value}</Badge>
{:else if value === "B"}
  <Badge class="bg-[#250033] text-[#d311fc] border-[#d311fc]">{value}</Badge>
{:else if value === "C"}
  <Badge class="bg-[#091f34] text-[#349afc] border-[#349afc]">{value}</Badge>
{:else if value === "D"}
  <Badge class="bg-[#053233] text-[#0effff] border-[#0effff]">{value}</Badge>
{:else if value === "E"}
  <Badge class="bg-[#0a3325] text-[#25ffc1] border-[#25ffc1]">{value}</Badge>
{:else if value === "F"}
  <Badge class="bg-[#2f342e] text-[#f3ffe9] border-[#f3ffe9]">{value}</Badge>
{/if}
