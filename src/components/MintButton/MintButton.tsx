'use client'

import { FC } from 'react'
import { ConnectDialog } from '../ConnectDialog'
import { MintDialog } from '../MintDialog'
import { MintDialogInfo } from '../MintDialog/Context/Context'
import { MintStatus, useValidate } from './useValidate'
import { Button, ButtonProps } from '../Button'
import { Loading } from '../icons/Loading'

import { useAccount } from 'wagmi'
import { getNow } from '@/utils/getNow'
import { CollectButton } from '../CollectButton/CollectButton'
import { FloorAsk } from '@reservoir0x/reservoir-kit-ui'
import { ExternalLinkButton } from '@/components/ExternalLinkButton/ExternalLinkButton'

interface MintButtonProps extends MintDialogInfo {
  size?: ButtonProps['size']
  floorAsk?: FloorAsk
}

export const MintButton: FC<MintButtonProps> = ({
  size,
  floorAsk,
  ...mintProps
}) => {
  const { address: account } = useAccount()
  const now = getNow()
  const {
    valid,
    message,
    isValidating,
    price,
    maxClaimablePerWallet,
    mintStatus,
  } = useValidate(
    mintProps.address,
    mintProps.mintType,
    mintProps.price,
    mintProps.mintDotFunStatus
  )

  const isMintedOut = mintStatus === MintStatus.MintedOut

  if (
    (mintProps.endDate && now >= mintProps.endDate) ||
    isMintedOut ||
    mintStatus == MintStatus.UserMintedMax
  ) {
    if (mintProps.address === '0x') {
      return <ExternalLinkButton partner={mintProps.partnerName} />
    }

    return (
      <CollectButton
        size={size}
        address={mintProps.address}
        floorAsk={floorAsk}
      />
    )
  }

  if (!account) {
    return <ConnectDialog size={size} />
  }

  if (isValidating) {
    return (
      <Button disabled size={size}>
        <span className="sr-only">Loading</span>
        <Loading
          className="animate-spin"
          color="white"
          height={24}
          width={24}
        />
      </Button>
    )
  }

  if (!valid) {
    return (
      <Button disabled size={size}>
        {message}
      </Button>
    )
  }

  const props: MintDialogInfo = {
    ...mintProps,
    price: price.toString(),
    maxClaimablePerWallet: maxClaimablePerWallet,
  }

  return (
    <MintDialog
      {...props}
      maxClaimablePerWallet={maxClaimablePerWallet}
      size={size}
    />
  )
}
