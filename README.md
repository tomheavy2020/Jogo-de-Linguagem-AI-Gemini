# Jogo-de-Linguagem-AI-Gemini
Pequena estrutura basica de jogos de linguagem feita em Python usando o Gemini.
Codigo Fonte pode ser usado programas para leitura de Python para seus teste.

Codigo Estrutura.
import random

def jogo_de_advinhacao():
  """
  Jogo que pede ao usuário para adivinhar uma linguagem de programação a partir de uma lista.
  """

  linguagens = ["Python", "JavaScript", "Java", "C++", "C#", "PHP", "Swift", "Kotlin"]
  linguagem_secreta = random.choice(linguagens).upper()

  tentativas = 3
  print("Bem-vindo ao Jogo de Adivinhação de Linguagem de Programação!")
  print(f"Você tem {tentativas} chances para acertar.")

  while tentativas > 0:
    palpite = input("Digite o nome de uma linguagem de programação: ").upper()

    if palpite == linguagem_secreta:
      print("Parabéns! Você acertou!")
      break
    else:
      tentativas -= 1
      if tentativas > 0:
        print(f"Tente novamente. Você ainda tem {tentativas} chances.")
      else:
        print(f"Você não conseguiu adivinhar. A linguagem era {linguagem_secreta}.")

jogo_de_advinhacao()
