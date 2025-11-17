"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { type FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import type { AddressType } from ".";
import { Loader2 } from "lucide-react";

interface AddressDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	address: AddressType;
	setAddress: (address: AddressType) => void;
	adrAddress: string;
	dialogTitle: string;
	isLoading: boolean;
	apiKey?: string;
}

interface AddressFields {
	address1?: string;
	address2?: string;
	city?: string;
	region?: string;
	postalCode?: string;
}

export function createAddressSchema(address: AddressFields) {
	const schema = {} as Record<string, unknown>;

	if (address.address1 !== "") {
		schema.address1 = z.string().min(1);
	}

	schema.address2 = z.string().optional();

	if (address.city !== "") {
		schema.city = z.string().min(1);
	}

	if (address.region !== "") {
		schema.region = z.string().min(1);
	}

	if (address.postalCode !== "") {
		schema.postalCode = z.string().min(1);
	}

	return z.object(schema);
}

export default function AddressDialog(
	props: React.PropsWithChildren<AddressDialogProps>,
) {
	const {
		children,
		dialogTitle,
		open,
		setOpen,
		address,
		setAddress,
		adrAddress,
		isLoading,
		apiKey: _apiKey, // reserved for real Google Places wiring
	} = props;

	const [address1, setAddress1] = useState("");
	const [address2, setAddress2] = useState("");
	const [city, setCity] = useState("");
	const [region, setRegion] = useState("");
	const [postalCode, setPostalCode] = useState("");

	const addressSchema = createAddressSchema({
		address1: address.address1,
		address2: address.address2,
		city: address.city,
		region: address.region,
		postalCode: address.postalCode,
	});

	function updateAndFormatAddress(
		addressString: string,
		addressComponents: {
			"street-address": string;
			address2: string;
			locality: string;
			region: string;
			"postal-code": string;
		},
	) {
		let updatedAddressString = addressString;

		Object.entries(addressComponents).forEach(([key, value]) => {
			if (key !== "address2") {
				const regex = new RegExp(`(<span class="${key}">)[^<]*(</span>)`, "g");
				updatedAddressString = updatedAddressString.replace(
					regex,
					`$1${value}$2`,
				);
			}
		});

		updatedAddressString = updatedAddressString.replace(/<\/?span[^>]*>/g, "");

		if (addressComponents.address2) {
			const address1Regex = new RegExp(
				`${addressComponents["street-address"]}`,
			);
			updatedAddressString = updatedAddressString.replace(
				address1Regex,
				`${addressComponents["street-address"]}, ${addressComponents.address2}`,
			);
		}

		updatedAddressString = updatedAddressString
			.replace(/,\s*,/g, ",")
			.trim()
			.replace(/\s\s+/g, " ")
			.replace(/,\s*$/, "");

		return updatedAddressString;
	}

	const handleSave = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			addressSchema.parse({
				address1,
				address2,
				city,
				region,
				postalCode,
			});
		} catch {
			// Defer showing validation in parent as requested; do nothing here.
			return;
		}

		const newFormattedAddress = updateAndFormatAddress(adrAddress || "", {
			"street-address": address1,
			address2,
			locality: city,
			region,
			"postal-code": postalCode,
		});

		setAddress({
			...address,
			city,
			region,
			address2,
			address1,
			postalCode,
			formattedAddress: newFormattedAddress || `${address1}, ${city} ${region} ${postalCode}`,
		});
		setOpen(false);
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setAddress1(address.address1);
		 
		setAddress2(address.address2 || "");
		 
		setPostalCode(address.postalCode);
		 
		setCity(address.city);
		 
		setRegion(address.region);
	}, [address]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="h-52 flex items-center justify-center">
						<Loader2 className="size-6 animate-spin" />
					</div>
				) : (
					<form onSubmit={handleSave}>
						<div className="space-y-4 py-7">
							<div className="space-y-0.5">
								<Label htmlFor="address1">Address line 1</Label>
								<Input
									value={address1}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress1(e.currentTarget.value)}
									id="address1"
									name="address1"
									placeholder="Address line 1"
								/>
							</div>

							<div className="space-y-0.5">
								<Label htmlFor="address2">Address line 2</Label>
								<Input
									value={address2}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress2(e.currentTarget.value)}
									id="address2"
									name="address2"
									placeholder="Address line 2"
								/>
							</div>

							<div className="flex gap-4">
								<div className="flex-1 space-y-0.5">
									<Label htmlFor="city">City</Label>
									<Input
										value={city}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.currentTarget.value)}
										id="city"
										name="city"
										placeholder="City"
									/>
								</div>
								<div className="flex-1 space-y-0.5">
									<Label htmlFor="region">State / Province / Region</Label>
									<Input
										value={region}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegion(e.currentTarget.value)}
										id="region"
										name="region"
										placeholder="Region"
									/>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex-1 space-y-0.5">
									<Label htmlFor="postalCode">Postal Code</Label>
									<Input
										value={postalCode}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostalCode(e.currentTarget.value)}
										id="postalCode"
										name="postalCode"
										placeholder="Postal Code"
									/>
								</div>
								<div className="flex-1 space-y-0.5">
									<Label htmlFor="country">Country</Label>
									<Input
										value={address?.country}
										id="country"
										readOnly
										name="country"
										placeholder="Country"
									/>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button type="reset" onClick={() => setOpen(false)} variant={"outline"}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
